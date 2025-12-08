export interface Reserva {
    id: number;
    codigoReserva?: string;
    clienteNombre: string;
    clienteContacto: string;
    fechaReserva: string;
    fechaExpiracion: string;
    estado: string; // "Pendiente", "Completada", etc.
    videojuegoId: number;
    videojuegoTitulo?: string;
    cantidad: number;
}