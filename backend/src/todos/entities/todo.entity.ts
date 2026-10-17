import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@ObjectType()
@Entity()
export class Todo {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column({ length: 200 })
  title: string;

  @Field()
  @Column({ default: 'TODO' })
  status: string;

  @Field(() => Boolean, { defaultValue: false })
  @Column({ type: 'boolean', default: false })
  starred: boolean;

  @Field(() => Int, { defaultValue: 0 })
  @Column({ type: 'int', default: 0 })
  order: number;
}
