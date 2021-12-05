import { Component, OnInit } from '@angular/core';
import { Product } from 'src/app/models/product';
import { ProductoService } from 'src/app/services/producto.service';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit {

  products : Product[] = [];

  constructor(
    private productService : ProductoService
  ) { }

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void{
    this.products = this.productService.getProducts();
  }

}
