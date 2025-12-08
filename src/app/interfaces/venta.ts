import { DetalleVenta } from './detalle-venta';

export interface Venta {
    id: number;
    fechaVenta: string;
    total: number;
    codigoReserva?: string;
    clienteNombre: string;
    usuarioId: number;
    usuarioNombre?: string;
    detalles: DetalleVenta[]; // lista de detalleventa
}