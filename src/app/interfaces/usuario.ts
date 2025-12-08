// se usa cuando se recibe la lista de usuarios (GET)
export interface UsuarioResponse {
    id: number;
    nombre: string;
    email: string;
    rol: string;
    activo: boolean;
}

// se usa solo cuando se vaya a crear un usuario (POST / Registro)
export interface UsuarioRegistro {
    nombre: string;
    email: string;
    password: string; // Obligatorio al registrar
    rol: string;      // "Admin" o "Vendedor"
}