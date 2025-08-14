

import subprocess
import getpass
import sys

# --- Configuración del Proyecto ---
PROJECT_REF = "qbsmayqqwwqqjzxcpfde"

# --- Funciones Auxiliares ---
def print_header(title):
    print("\n" + "="*50)
    print(f"  {title}")
    print("="*50)

def print_command(command):
    print("\n" + "-"*50)
    print("COPIA Y EJECUTA EL SIGUIENTE COMANDO EN TU TERMINAL:")
    print("-"*50)
    print(f"\n{command}\n")
    print("-"*50)

def check_cli_installed():
    try:
        subprocess.run(["npx", "supabase", "--version"], check=True, capture_output=True)
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("[ERROR] La CLI de Supabase no está instalada o no funciona correctamente.")
        print("Asegúrate de tener Node.js instalado y ejecuta 'npm install supabase --save-dev'")
        sys.exit(1)

# --- Funciones del Menú ---
def login_step():
    print_header("Paso 1: Iniciar Sesión en Supabase")
    print("Primero, necesitas un nuevo Token de Acceso de Supabase.")
    print("Ve a: https://supabase.com/dashboard/account/tokens")
    print("Genera un nuevo token (con permisos por defecto) y pégalo a continuación.")
    
    token = input("\nPega tu nuevo Token de Acceso aquí y presiona Enter: ")
    
    if not token.strip():
        print("\n[ERROR] No se ha introducido ningún token. Abortando.")
        return

    command = f"npx supabase login --token {token.strip()}"
    print_command(command)

def link_step():
    print_header("Paso 2: Vincular Proyecto")
    print("Este paso conectará tu carpeta local con tu proyecto en la nube.")
    print("Se te pedirá la contraseña de tu base de datos.")
    
    db_password = getpass.getpass("Pega la contraseña de tu base de datos y presiona Enter (no se mostrará): ")

    if not db_password.strip():
        print("\n[ERROR] No se ha introducido ninguna contraseña. Abortando.")
        return

    command = f'npx supabase link --project-ref {PROJECT_REF} -p "{db_password.strip()}"'
    print_command(command)

def push_step():
    print_header("Paso 3: Subir Cambios a la Base de Datos")
    print("Esto aplicará todas tus migraciones locales y el fichero seed.sql a la base de datos en la nube.")
    command = "npx supabase db push"
    print_command(command)

def main_menu():
    check_cli_installed()
    while True:
        print_header("Panel de Control de Supabase para MAIS")
        print("1. Iniciar Sesión en Supabase (Primer paso)")
        print("2. Vincular Proyecto con Supabase")
        print("3. Subir Cambios a la Base de Datos (db push)")
        print("4. Salir")
        choice = input("\nElige una opción (1-4): ")

        if choice == '1':
            login_step()
        elif choice == '2':
            link_step()
        elif choice == '3':
            push_step()
        elif choice == '4':
            print("\nSaliendo del panel de control.")
            break
        else:
            print("\n[ERROR] Opción no válida. Por favor, elige de nuevo.")

if __name__ == "__main__":
    main_menu()
