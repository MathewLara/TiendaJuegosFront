export interface Reserva {
    id: number;
    codigoReserva?: string;
    clienteNombre: string;
    cedula: string; // <-- ¡Agrega esta línea!  
    clienteContacto: string;
    fechaReserva: string;
    fechaExpiracion: string;
    estado: string; // "Pendiente", "Completada", etc.
    videojuegoId: number;
    videojuegoTitulo?: string;
    cantidad: number;
}