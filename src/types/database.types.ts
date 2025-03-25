export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      order_items: {
        Row: {
          id: string
          order_id: string
          price: number
          product_id: string
          quantity: number
        }
        Insert: {
          id?: string
          order_id: string
          price: number
          product_id: string
          quantity: number
        }
        Update: {
          id?: string
          order_id?: string
          price?: number
          product_id?: string
          quantity?: number
        }
      }
      orders: {
        Row: {
          id: string
          user_id: string
          total: number
          status: string
          notes: string | null
          created_at: string
          customer_name: string
          customer_phone: string | null
          delivery_address: string | null
        }
        Insert: {
          id?: string
          user_id: string
          total?: number
          status?: string
          notes?: string | null
          created_at?: string
          customer_name: string
          customer_phone?: string | null
          delivery_address?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          total?: number
          status?: string
          notes?: string | null
          created_at?: string
          customer_name?: string
          customer_phone?: string | null
          delivery_address?: string | null
        }
      }
      products: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          name: string
          price: number
          stock: number
          unit_price: number
          box_price: number
          unit_stock: number
          box_stock: number
          units_per_box: number
          unit_weight: number | null
          box_weight: number | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          price: number
          stock?: number
          unit_price: number
          box_price: number
          unit_stock: number
          box_stock: number
          units_per_box: number
          unit_weight?: number | null
          box_weight?: number | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          price?: number
          stock?: number
          unit_price?: number
          box_price?: number
          unit_stock?: number
          box_stock?: number
          units_per_box?: number
          unit_weight?: number | null
          box_weight?: number | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}