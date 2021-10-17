import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm'

@Entity({name: 'user'})
export class User {
    @PrimaryGeneratedColumn()
    id: number

    @Column('varchar')
    account: string

    @Column('varchar')
    password: string

    @Column('varchar')
    create_time: string

    @Column('tinyint')
    status: number
}