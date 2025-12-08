export interface Videojuego {
    id: number;
    titulo: string;
    descripcion: string;
    precio: number;
    stock: number;
    urlImagen?: string; // El ? es porque en C# es string? (nullable)
    fechaLanzamiento: string; // Las fechas viajan como texto ISO
    activo: boolean;
    categoriaId: number;
    categoriaNombre?: string; // Campo extra solo de lectura
}