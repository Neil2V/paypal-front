import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ICreateOrderRequest, IPayPalConfig } from 'ngx-paypal';
import { NgxSpinnerService } from 'ngx-spinner';
import { CartItem } from 'src/app/models/cart-item';
import { Product } from 'src/app/models/product';
import { MessageService } from 'src/app/services/message.service';
import { ProductStorageService } from 'src/app/services/product-storage.service';
import { environment } from 'src/environments/environment';
import { ModalComponent } from '../modal/modal.component';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {

  CartItems : CartItem[] = [];
  total = 0;

  public payPalConfig ? : IPayPalConfig;

  constructor(
    private messageService: MessageService,
    private productStorageService: ProductStorageService,
    private modalService: NgbModal,
    private spinner: NgxSpinnerService
  ) { }

  ngOnInit(): void {
    this.initConfig();
    if(this.productStorageService.existsCart()){
      this.CartItems = this.productStorageService.getCart();
    }
    this.getItem();
    this.total = this.getTotal();
    
  }

  private initConfig(): void {
    this.payPalConfig = {
      currency: 'EUR',
      clientId: environment.clientId,
      // tslint:disable-next-line: no-angle-bracket-type-assertion
      createOrderOnClient: (data) => <ICreateOrderRequest> {
        intent: 'CAPTURE',
        purchase_units: [{
          amount: {
            currency_code: 'EUR',
            value: this.getTotal().toString(),
            breakdown: {
              item_total: {
                currency_code: 'EUR',
                value: this.getTotal().toString()
              }
            }
          },
          items: this.getItemsPaypal()
        }]
      },
      advanced: {
        commit: 'true'
      },
      style: {
        label: 'paypal',
        layout: 'vertical'
      },
      onApprove: (data, actions) => {
        this.spinner.show();
        console.log('onApprove - transaction was approved, but not authorized', data, actions);
        actions.order.get().then((details : any) => {
          console.log('onApprove - you can get full order details inside onApprove: ', details);
        });

      },
      onClientAuthorization: (data) => {
        console.log('onClientAuthorization - you should probably inform your server about completed transaction at this point',
        JSON.stringify(data));
        console.log("data1: ",data.purchase_units[0].items);
        console.log("data2: ",data.purchase_units[0].amount.value);
        this.openModal(
          data.purchase_units[0].items,
          data.purchase_units[0].amount.value
        );
        this.emptyCart();
        this.spinner.hide();
      },
      onCancel: (data, actions) => {
        console.log('OnCancel', data, actions);
      },
      onError: err => {
        console.log('OnError', err);
      },
      onClick: (data, actions) => {
        console.log('onClick', data, actions);
      },
    };
  }

  getItemsPaypal(): any[]{
    const items : any[] = [];
    let item = {};

    this.CartItems.forEach((it: CartItem) => {
      item = {
        name: it.productName,
        quantity: it.qty,
        unit_amount: {
          currency_code: 'EUR',
          value: it.productPrice,
        },
      }
      items.push(item);
    });
    return items;
  }

  getItem(): void{

    this.messageService.getMessage().subscribe((product: Product) => {
      let exists = false;
      this.CartItems.forEach( item => {
        if(item.productId === product.id){
          item.qty++;
          exists = true;
        }

      });

      if(!exists){
        const cartItem = new CartItem(product);
        this.CartItems.push(cartItem);
      }
      this.total = this.getTotal();
      this.productStorageService.setCart(this.CartItems);
    });
  }

  getTotal(): number {
    let total = 0;
    this.CartItems.forEach(item => {
      total += item.qty * item.productPrice;
    });
    return +total.toFixed(2);
  }

  emptyCart(): void{
    this.CartItems = [];
    this.total = 0;
    this.productStorageService.delete();
  }

  deleteItem(i: number): void{

    if(this.CartItems[i].qty>1){
      this.CartItems[i].qty--;

    }else{
      this.CartItems.splice(i,1);
    }
    this.total = this.getTotal(); 
    this.productStorageService.setCart(this.CartItems);
  }

  openModal(items : any[], amount: any): void {
    const modalRef = this.modalService.open(ModalComponent);
    modalRef.componentInstance.items = items;
    modalRef.componentInstance.amount = amount;
  }

}
