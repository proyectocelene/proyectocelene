#!/usr/bin/env python3
"""
Script para optimizar imágenes locales del proyecto Celene.
Realiza:
- Renombrado (reemplaza espacios con guiones bajos)
- Compresión (JPEG 85%, PNG 80%)
- Redimensionado de imágenes críticas a 1200x630 para Open Graph
- Conversión opcional a WebP
- Mantiene copias de seguridad en subdirectorio backup/
"""

import os
import sys
import shutil
from pathlib import Path
from PIL import Image, ImageOps

# Configuración
IMAGE_DIR = Path("imagenes")
BACKUP_DIR = IMAGE_DIR / "backup"
LOG_FILE = Path("optimizacion_log.txt")

# Extensiones de imagen a procesar
IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".JPG", ".JPEG", ".PNG"}

# Imágenes críticas para redimensionar a 1200x630 (Open Graph)
# Nota: se buscará por nombres coincidentes (sin espacios, sin mayúsculas)
CRITICAL_IMAGES = {
    "logo-pc-circulo.png",
    "logo pc circulo.png",
    "MAMOGRAFIA.jpg",
    "CONSULTA-GENERAL.jpg",
    "CONSULTA GENERAL.jpg",
    "foto-de-colaboradores-de-proyectocelene.jpg",
    "foto de colaboradores de proyectocelene.jpg",
}

# Tamaño objetivo Open Graph
OG_WIDTH = 1200
OG_HEIGHT = 630

# Calidades de compresión
JPEG_QUALITY = 85
PNG_QUALITY = 80  # para PNG, se usa optimización, no calidad
WEBP_QUALITY = 80

# Modo de ejecución
CREATE_WEBP = True  # Crear versión WebP adicional
BACKUP_ORIGINALS = True

def setup_directories():
    """Crea directorio de backup si no existe."""
    BACKUP_DIR.mkdir(parents=True, exist_ok=True)

def normalize_filename(filename):
    """
    Reemplaza espacios por guiones bajos y convierte a minúsculas.
    También elimina caracteres extraños.
    """
    # Reemplazar espacios por guiones bajos
    new_name = filename.replace(" ", "_")
    # Opcional: reemplazar múltiples guiones bajos por uno solo
    while "__" in new_name:
        new_name = new_name.replace("__", "_")
    # Quitar caracteres no alfanuméricos (excepto punto y guión bajo)
    # Pero mantengamos la extensión
    base, ext = os.path.splitext(new_name)
    import re
    base = re.sub(r'[^a-zA-Z0-9_-]', '', base)
    new_name = base + ext.lower()
    return new_name

def is_critical_image(filename):
    """Determina si el archivo está en la lista de imágenes críticas."""
    # Comparar con nombres normalizados y originales
    normalized = normalize_filename(filename)
    original = filename
    for crit in CRITICAL_IMAGES:
        if crit.lower() == original.lower() or crit.lower() == normalized.lower():
            return True
    return False

def compress_image(input_path, output_path):
    """
    Comprime imagen según su formato.
    Retorna nuevo tamaño en bytes.
    """
    try:
        with Image.open(input_path) as img:
            # Convertir a RGB si es RGBA (para JPEG)
            if img.mode in ("RGBA", "P"):
                img = img.convert("RGB")
            # Guardar con calidad optimizada
            ext = output_path.suffix.lower()
            if ext in (".jpg", ".jpeg"):
                img.save(output_path, "JPEG", quality=JPEG_QUALITY, optimize=True)
            elif ext == ".png":
                img.save(output_path, "PNG", optimize=True, compress_level=9)
            else:
                # Otros formatos: copiar sin cambios
                shutil.copy2(input_path, output_path)
            return output_path.stat().st_size
    except Exception as e:
        print(f"  ERROR comprimiendo {input_path}: {e}")
        return 0

def resize_for_og(input_path, output_path):
    """
    Redimensiona imagen a 1200x630 manteniendo relación de aspecto,
    añadiendo bordes negros si es necesario.
    """
    try:
        with Image.open(input_path) as img:
            # Convertir a RGB si es RGBA
            if img.mode in ("RGBA", "P"):
                img = img.convert("RGB")
            
            # Calcular dimensiones para encajar dentro de 1200x630
            img_width, img_height = img.size
            target_ratio = OG_WIDTH / OG_HEIGHT
            img_ratio = img_width / img_height
            
            if img_ratio > target_ratio:
                # La imagen es más ancha que el objetivo: ajustar ancho
                new_width = OG_WIDTH
                new_height = int(OG_WIDTH / img_ratio)
            else:
                # La imagen es más alta que el objetivo: ajustar alto
                new_height = OG_HEIGHT
                new_width = int(OG_HEIGHT * img_ratio)
            
            # Redimensionar con filtro LANCZOS (alta calidad)
            resized = img.resize((new_width, new_height), Image.Resampling.LANCZOS)
            
            # Crear canvas de tamaño exacto con color de fondo negro
            canvas = Image.new("RGB", (OG_WIDTH, OG_HEIGHT), color="black")
            # Pegar la imagen redimensionada centrada
            offset = ((OG_WIDTH - new_width) // 2, (OG_HEIGHT - new_height) // 2)
            canvas.paste(resized, offset)
            
            # Guardar como JPEG (Open Graph recomienda JPEG)
            output_path = output_path.with_suffix(".jpg")
            canvas.save(output_path, "JPEG", quality=JPEG_QUALITY, optimize=True)
            return output_path, canvas.size
    except Exception as e:
        print(f"  ERROR redimensionando {input_path}: {e}")
        return None, None

def convert_to_webp(input_path, output_path):
    """Convierte imagen a WebP con calidad especificada."""
    try:
        with Image.open(input_path) as img:
            if img.mode in ("RGBA", "P"):
                img = img.convert("RGB")
            webp_path = output_path.with_suffix(".webp")
            img.save(webp_path, "WEBP", quality=WEBP_QUALITY)
            return webp_path.stat().st_size
    except Exception as e:
        print(f"  ERROR convirtiendo a WebP {input_path}: {e}")
        return 0

def process_image(filepath, logf):
    """
    Procesa una imagen individual:
    1. Copia de seguridad
    2. Renombrado
    3. Compresión
    4. Redimensionado si es crítica
    5. Conversión a WebP opcional
    """
    original_size = filepath.stat().st_size
    original_name = filepath.name
    relative_path = filepath.relative_to(IMAGE_DIR)
    
    print(f"Procesando: {relative_path}")
    logf.write(f"{relative_path}\n")
    logf.write(f"  Tamaño original: {original_size} bytes\n")
    
    # Paso 1: Copia de seguridad (con nombre original, manteniendo espacios)
    if BACKUP_ORIGINALS:
        backup_path = BACKUP_DIR / relative_path
        backup_path.parent.mkdir(parents=True, exist_ok=True)
        if not backup_path.exists():
            shutil.copy2(filepath, backup_path)
            print(f"  Backup guardado en: {backup_path.relative_to(IMAGE_DIR)}")
    
    # Paso 2: Renombrar archivo (mover a nuevo nombre sin espacios)
    new_name = normalize_filename(original_name)
    new_path = filepath.parent / new_name
    if new_path != filepath:
        # Si el nombre cambió, mover el archivo (renombrar)
        try:
            filepath.rename(new_path)
            print(f"  Renombrado a: {new_name}")
            # Actualizar filepath para pasos siguientes
            filepath = new_path
        except Exception as e:
            print(f"  ERROR renombrando: {e}")
            logf.write(f"  ERROR renombrando: {e}\n")
            # Continuar con el archivo original
    
    # Paso 3: Comprimir (sobrescribir el archivo renombrado)
    compressed_size = compress_image(filepath, filepath)
    if compressed_size > 0:
        reduction = original_size - compressed_size
        reduction_pct = (reduction / original_size) * 100 if original_size > 0 else 0
        print(f"  Comprimido: {compressed_size} bytes ({reduction_pct:.1f}% reducción)")
        logf.write(f"  Tamaño comprimido: {compressed_size} bytes ({reduction_pct:.1f}% reducción)\n")
    else:
        compressed_size = original_size
        logf.write(f"  No se pudo comprimir, se mantiene tamaño original\n")
    
    # Paso 4: Si es imagen crítica, crear versión Open Graph
    if is_critical_image(original_name):
        og_filename = filepath.stem + "_og.jpg"
        og_path = filepath.parent / og_filename
        og_path_final, og_dims = resize_for_og(filepath, og_path)
        if og_path_final:
            og_size = og_path_final.stat().st_size
            print(f"  Open Graph: {og_path_final.name} {og_dims[0]}x{og_dims[1]}, {og_size} bytes")
            logf.write(f"  Open Graph generado: {og_path_final.name} {og_dims[0]}x{og_dims[1]}, {og_size} bytes\n")
    
    # Paso 5: Crear versión WebP (opcional)
    if CREATE_WEBP:
        webp_size = convert_to_webp(filepath, filepath)
        if webp_size > 0:
            print(f"  WebP creado: {webp_size} bytes")
            logf.write(f"  WebP creado: {webp_size} bytes\n")
    
    logf.write("\n")
    return compressed_size

def main():
    print("=== Optimización de imágenes locales ===\n")
    setup_directories()
    
    # Contadores
    total_images = 0
    total_original_size = 0
    total_compressed_size = 0
    
    with open(LOG_FILE, "w", encoding="utf-8") as logf:
        logf.write("Registro de optimización de imágenes\n")
        logf.write("====================================\n\n")
        
        # Recorrer recursivamente IMAGE_DIR
        for root, dirs, files in os.walk(IMAGE_DIR):
            # Excluir directorio backup
            if "backup" in root.split(os.sep):
                continue
            for file in files:
                filepath = Path(root) / file
                ext = filepath.suffix.lower()
                if ext in IMAGE_EXTENSIONS:
                    total_images += 1
                    original_size = filepath.stat().st_size
                    total_original_size += original_size
                    
                    # Procesar imagen
                    compressed_size = process_image(filepath, logf)
                    total_compressed_size += compressed_size
        
        # Resumen
        logf.write("\n=== RESUMEN ===\n")
        logf.write(f"Imágenes procesadas: {total_images}\n")
        logf.write(f"Tamaño total original: {total_original_size} bytes ({total_original_size / 1024 / 1024:.2f} MB)\n")
        logf.write(f"Tamaño total comprimido: {total_compressed_size} bytes ({total_compressed_size / 1024 / 1024:.2f} MB)\n")
        if total_original_size > 0:
            reduction = total_original_size - total_compressed_size
            reduction_pct = (reduction / total_original_size) * 100
            logf.write(f"Reducción total: {reduction} bytes ({reduction_pct:.1f}%)\n")
        else:
            logf.write("Reducción total: 0 bytes (0%)\n")
    
    print(f"\nProceso completado. Ver detalles en {LOG_FILE}")
    print(f"Backups guardados en {BACKUP_DIR}")

if __name__ == "__main__":
    main()