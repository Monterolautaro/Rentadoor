import { Roles } from "src/common/enums/roles.enum";


export interface IUser {
    id: number,
    nombre: string,
    email: string,
    telefono: string,
    contraseña: string,
    rol: Roles,
    isEmailVerified: boolean
}