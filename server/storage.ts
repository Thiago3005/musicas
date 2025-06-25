import { eq, desc } from "drizzle-orm";
import { db } from "./db";
import { 
  users, musicos, missas, musicas, bibliotecaMusicas, musicoAnotacoes, musicoSugestoes, missaMusicos, musicoIndisponibilidade,
  type User, type InsertUser, type Musico, type InsertMusico, type Missa, type InsertMissa,
  type Musica, type InsertMusica, type BibliotecaMusica, type InsertBibliotecaMusica
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Musicos
  getMusicos(): Promise<Musico[]>;
  getMusicoById(id: string): Promise<Musico | undefined>;
  createMusico(musico: InsertMusico): Promise<Musico>;
  updateMusico(id: string, musico: Partial<InsertMusico>): Promise<Musico>;
  deleteMusico(id: string): Promise<void>;
  
  // Missas
  getMissas(): Promise<Missa[]>;
  getMissaById(id: string): Promise<Missa | undefined>;
  createMissa(missa: InsertMissa): Promise<Missa>;
  updateMissa(id: string, missa: Partial<InsertMissa>): Promise<Missa>;
  deleteMissa(id: string): Promise<void>;
  
  // Musicas
  getMusicasByMissaId(missaId: string): Promise<Musica[]>;
  createMusica(musica: InsertMusica): Promise<Musica>;
  deleteMusica(id: string): Promise<void>;
  
  // Biblioteca de Musicas
  getBibliotecaMusicas(): Promise<BibliotecaMusica[]>;
  createBibliotecaMusica(musica: InsertBibliotecaMusica): Promise<BibliotecaMusica>;
  deleteBibliotecaMusica(id: string): Promise<void>;
  
  // Anotacoes
  getAnotacoesByMusicoId(musicoId: string): Promise<any[]>;
  createAnotacao(musicoId: string, texto: string): Promise<any>;
  deleteAnotacao(id: string): Promise<void>;
  
  // Sugestoes
  getSugestoesByMusicoId(musicoId: string): Promise<any[]>;
  createSugestao(musicoId: string, texto: string): Promise<any>;
  updateSugestaoStatus(id: string, status: string): Promise<any>;
  
  // Indisponibilidades
  getIndisponibilidades(): Promise<any[]>;
  
  // Missa Musicos
  getMissaMusicos(missaId: string): Promise<any[]>;
  createMissaMusico(data: any): Promise<any>;
  deleteMissaMusico(id: string): Promise<void>;
  getIndisponibilidadesByMusicoId(musicoId: string): Promise<any[]>;
  createIndisponibilidade(data: any): Promise<any>;
  updateIndisponibilidade(id: string, data: any): Promise<any>;
  deleteIndisponibilidade(id: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  // Musicos
  async getMusicos(): Promise<Musico[]> {
    return await db.select().from(musicos);
  }

  async getMusicoById(id: string): Promise<Musico | undefined> {
    const result = await db.select().from(musicos).where(eq(musicos.id, id));
    return result[0];
  }

  async createMusico(musico: InsertMusico): Promise<Musico> {
    const result = await db.insert(musicos).values(musico).returning();
    return result[0];
  }

  async updateMusico(id: string, musico: Partial<InsertMusico>): Promise<Musico> {
    const result = await db.update(musicos).set(musico).where(eq(musicos.id, id)).returning();
    return result[0];
  }

  async deleteMusico(id: string): Promise<void> {
    await db.delete(musicos).where(eq(musicos.id, id));
  }

  // Missas
  async getMissas(): Promise<Missa[]> {
    return await db.select().from(missas);
  }

  async getMissaById(id: string): Promise<Missa | undefined> {
    const result = await db.select().from(missas).where(eq(missas.id, id));
    return result[0];
  }

  async createMissa(missa: InsertMissa): Promise<Missa> {
    const result = await db.insert(missas).values(missa).returning();
    return result[0];
  }

  async updateMissa(id: string, missa: Partial<InsertMissa>): Promise<Missa> {
    const result = await db.update(missas).set(missa).where(eq(missas.id, id)).returning();
    return result[0];
  }

  async deleteMissa(id: string): Promise<void> {
    await db.delete(missas).where(eq(missas.id, id));
  }

  // Musicas
  async getMusicasByMissaId(missaId: string): Promise<Musica[]> {
    return await db.select().from(musicas).where(eq(musicas.missa_id, missaId));
  }

  async createMusica(musica: InsertMusica): Promise<Musica> {
    const result = await db.insert(musicas).values(musica).returning();
    return result[0];
  }

  async deleteMusica(id: string): Promise<void> {
    await db.delete(musicas).where(eq(musicas.id, id));
  }

  // Biblioteca de Musicas
  async getBibliotecaMusicas(): Promise<BibliotecaMusica[]> {
    return await db.select().from(bibliotecaMusicas);
  }

  async createBibliotecaMusica(musica: InsertBibliotecaMusica): Promise<BibliotecaMusica> {
    const result = await db.insert(bibliotecaMusicas).values(musica).returning();
    return result[0];
  }

  async deleteBibliotecaMusica(id: string): Promise<void> {
    await db.delete(bibliotecaMusicas).where(eq(bibliotecaMusicas.id, id));
  }

  // Anotacoes
  async getAnotacoesByMusicoId(musicoId: string): Promise<any[]> {
    return await db.select().from(musicoAnotacoes).where(eq(musicoAnotacoes.musico_id, musicoId));
  }

  async createAnotacao(musicoId: string, texto: string): Promise<any> {
    const result = await db.insert(musicoAnotacoes).values({ musico_id: musicoId, texto }).returning();
    return result[0];
  }

  async deleteAnotacao(id: string): Promise<void> {
    await db.delete(musicoAnotacoes).where(eq(musicoAnotacoes.id, id));
  }

  // Sugestoes
  async getSugestoesByMusicoId(musicoId: string): Promise<any[]> {
    return await db.select().from(musicoSugestoes).where(eq(musicoSugestoes.musico_id, musicoId));
  }

  async createSugestao(musicoId: string, texto: string): Promise<any> {
    const result = await db.insert(musicoSugestoes).values({ musico_id: musicoId, texto }).returning();
    return result[0];
  }

  async updateSugestaoStatus(id: string, status: string): Promise<any> {
    const result = await db.update(musicoSugestoes).set({ status }).where(eq(musicoSugestoes.id, id)).returning();
    return result[0];
  }

  // Indisponibilidades
  async getIndisponibilidades(): Promise<any[]> {
    return db.select().from(musicoIndisponibilidade).orderBy(desc(musicoIndisponibilidade.created_at));
  }

  async getIndisponibilidadesByMusicoId(musicoId: string): Promise<any[]> {
    return db.select().from(musicoIndisponibilidade)
      .where(eq(musicoIndisponibilidade.musico_id, musicoId))
      .orderBy(desc(musicoIndisponibilidade.data_inicio));
  }

  async createIndisponibilidade(data: any): Promise<any> {
    const result = await db.insert(musicoIndisponibilidade)
      .values(data)
      .returning();
    return result[0];
  }

  async updateIndisponibilidade(id: string, data: any): Promise<any> {
    const result = await db.update(musicoIndisponibilidade)
      .set({ ...data, updated_at: new Date() })
      .where(eq(musicoIndisponibilidade.id, id))
      .returning();
    return result[0];
  }

  async deleteIndisponibilidade(id: string): Promise<void> {
    await db.delete(musicoIndisponibilidade)
      .where(eq(musicoIndisponibilidade.id, id));
  }

  async getMissaMusicos(missaId: string): Promise<any[]> {
    const result = await db
      .select({
        id: missaMusicos.id,
        parte_missa: missaMusicos.parte_missa,
        funcao: missaMusicos.funcao,
        instrumento: missaMusicos.instrumento,
        observacoes: missaMusicos.observacoes,
        musico: {
          id: musicos.id,
          nome: musicos.nome,
          funcao: musicos.funcao,
          instrumento: musicos.email
        }
      })
      .from(missaMusicos)
      .leftJoin(musicos, eq(missaMusicos.musico_id, musicos.id))
      .where(eq(missaMusicos.missa_id, missaId));
    return result;
  }

  async createMissaMusico(data: any): Promise<any> {
    const result = await db.insert(missaMusicos)
      .values({
        missa_id: data.missa_id,
        musico_id: data.musico_id,
        parte_missa: data.parte_missa,
        funcao: data.funcao,
        instrumento: data.instrumento,
        observacoes: data.observacoes
      })
      .returning();
    return result[0];
  }

  async deleteMissaMusico(id: string): Promise<void> {
    await db.delete(missaMusicos)
      .where(eq(missaMusicos.id, id));
  }
}

export const storage = new DatabaseStorage();
