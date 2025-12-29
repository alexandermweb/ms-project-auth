import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";



@Entity()
export class User{

  @PrimaryGeneratedColumn('uuid')
  id:string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email:string;

  @Column({ type: 'varchar', length: 100 })
  name:string;

  @Column({ type: 'varchar', length: 255 })
  password:string;
}