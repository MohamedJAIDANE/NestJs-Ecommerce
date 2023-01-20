import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Cart, CartDocument } from './schemas/cart.schema';
import { ItemDTO } from './dtos/item.dto';

@Injectable()
export class CartService {
    constructor(@InjectModel('Cart') private readonly cartModel: Model<CartDocument>) { }

    //create Cart
    async createCart(userId: string, itemDTO: ItemDTO, subTotalPrice: number, totalPrice: number): Promise<Cart> {
        const newCart = await this.cartModel.create({
            userId,
            items: [{ ...itemDTO, subTotalPrice }],
            totalPrice
        });
        return newCart;
    }

    //get Cart
    async getCart(userId: string): Promise<CartDocument> {
        const cart = await this.cartModel.findOne({ userId });
        return cart;
    }

    //delete Cart
    async deleteCart(userId: string): Promise<Cart> {
        const deletedCart = await this.cartModel.findOneAndRemove({ userId });
        return deletedCart;
    }

    //recalculate cart 
    private recalculateCart(cart: CartDocument) {
        cart.totalPrice = 0;
        cart.items.forEach(item => {
            cart.totalPrice += (item.quantity * item.price);
        })
    }

    //add item to cart
    async addItemToCart(userId: string, itemDTO: ItemDTO): Promise<Cart> {
        const { productId, quantity, price } = itemDTO;
        const subTotalPrice = quantity * price;

        const cart = await this.getCart(userId);

        if (cart) {
            const itemIndex = cart.items.findIndex((item) => item.productId == productId);

            if (itemIndex > -1) {
                let item = cart.items[itemIndex];
                item.quantity = Number(item.quantity) + Number(quantity);
                item.subTotalPrice = item.quantity * item.price;

                cart.items[itemIndex] = item;
                this.recalculateCart(cart);
                return cart.save();
            } else {
                cart.items.push({ ...itemDTO, subTotalPrice });
                this.recalculateCart(cart);
                return cart.save();
            }
        } else {
            const newCart = await this.createCart(userId, itemDTO, subTotalPrice, price);
            return newCart;
        }
    }

    // remouve item from cart
    async removeItemFromCart(userId: string, productId: string): Promise<any> {
        const cart = await this.getCart(userId);
      
        const itemIndex = cart.items.findIndex((item) => item.productId == productId);
      
        if (itemIndex > -1) {
          cart.items.splice(itemIndex, 1);
          this.recalculateCart(cart);
          return cart.save();
        }
      }
}

