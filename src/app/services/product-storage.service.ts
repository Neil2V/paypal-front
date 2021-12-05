import { Injectable } from '@angular/core';
import { CartItem } from '../models/cart-item';

@Injectable({
  providedIn: 'root'
})
export class ProductStorageService {

  constructor() { }

  existsCart(): boolean {
    return localStorage.getItem('cart')!=null;
  }

  setCart(cartItem: CartItem[]): void{
    localStorage.setItem('cart',JSON.stringify(cartItem));
  }

  getCart(): CartItem[] {
    return JSON.parse(localStorage.getItem('cart') || "");
  }

  delete(): void{
    localStorage.removeItem('cart');
  }

}
