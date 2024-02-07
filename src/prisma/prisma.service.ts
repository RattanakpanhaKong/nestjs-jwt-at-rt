import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy{
    constructor(){
        super({
            datasources: {
                db: {
                    url: "postgresql://postgres:12345@localhost:5432/nestjs?schema=public"
                }
            }
        })
    }
    async onModuleInit() {
        await this.$connect();
    }
    async onModuleDestroy() {
        this.$disconnect();
    }

}
