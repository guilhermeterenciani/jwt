import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();
class Database {
  private pool: mysql.Pool;
  constructor() {
    this.pool = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
  }
  async query(sql: string, params: any[] = []): Promise<any> {
    const connection = await this.pool.getConnection();
    try {
      const [rows] = await connection.query(sql, params);
      return rows;
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    } finally {
      connection.release();
    }
  }
  async close() {
    await this.pool.end();
  }
  async getConnection() {
    return await this.pool.getConnection();
  }
  async releaseConnection(connection: mysql.PoolConnection) {
    await connection.release();
  }
  async beginTransaction(connection: mysql.PoolConnection) {
    await connection.beginTransaction();
  }
  async commitTransaction(connection: mysql.PoolConnection) {
    await connection.commit();
  }
  async rollbackTransaction(connection: mysql.PoolConnection) {
    await connection.rollback();
  }
  async queryWithTransaction(connection: mysql.PoolConnection, sql: string, params: any[] = []): Promise<any> {
    try {
      const [rows] = await connection.query(sql, params);
      return rows;
    } catch (error) {
      console.error('Database transaction error:', error);
      throw error;
    }
  }

}
export default Database