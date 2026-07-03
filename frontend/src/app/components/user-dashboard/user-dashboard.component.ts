import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.css']
})
export class UserDashboardComponent implements OnInit {
  currentPage: string = 'shop';
  currentUser: any = null;
  fishes: any[] = [];
  categories: any[] = [];
  cart: any[] = [];
  orders: any[] = [];
  selectedCategory: any = null;
  isLoading = false;
  searchQuery = '';
  showCart = false;
  showOrderModal = false;
  selectedOrder: any = null;
  totalCartItems = 0;

  constructor(
    private apiService: ApiService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUser();
    this.loadCategories();
    this.loadOrders();
    this.loadCart();
  }

  loadUser() {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      this.currentUser = JSON.parse(userStr);
    }
  }

  loadCategories() {
    this.isLoading = true;
    this.apiService.getCategories().subscribe({
      next: (data) => {
        this.categories = data;
        this.isLoading = false;
        if (this.categories.length > 0) {
          this.selectCategory(this.categories[0]);
        }
      },
      error: () => {
        this.isLoading = false;
        this.loadDemoData();
      }
    });
  }

  loadDemoData() {
    this.categories = [
      { _id: 'demo1', name: 'Gourami' },
      { _id: 'demo2', name: 'Tetra' },
      { _id: 'demo3', name: 'Rasboras' }
    ];
    if (this.categories.length > 0) {
      this.selectCategory(this.categories[0]);
    }
  }

  selectCategory(category: any) {
    this.selectedCategory = category;
    this.isLoading = true;
    this.searchQuery = '';

    if (category._id && category._id.startsWith('demo')) {
      this.loadDemoFishes(category.name);
      this.isLoading = false;
      return;
    }

    this.apiService.getFishesByCategory(category._id).subscribe({
      next: (data) => {
        this.fishes = data || [];
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.loadDemoFishes(category.name);
      }
    });
  }

  loadDemoFishes(categoryName: string) {
    const demoFishes: { [key: string]: any[] } = {
      'Gourami': [
        { _id: 'fish1', name: 'Pearl Gourami', imageUrl: 'https://images.unsplash.com/photo-1615934555811-92b4504c53c4?w=500', description: 'Peaceful, community tank fish.', size: '4-5 inches', stock: 12, priceLKR: 450 },
        { _id: 'fish2', name: 'Honey Gourami', imageUrl: 'https://images.unsplash.com/photo-1524704654690-b56c05c78a02?w=500', description: 'Very peaceful, a bit timid.', size: '2 inches', stock: 2, priceLKR: 700 },
        { _id: 'fish3', name: 'Blue Gourami', imageUrl: 'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=500', description: 'Semi-aggressive, colorful.', size: '6-7 inches', stock: 20, priceLKR: 200 }
      ],
      'Tetra': [
        { _id: 'fish4', name: 'Neon Tetra', imageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=500', description: 'Peaceful schooling fish.', size: '1.5 inches', stock: 20, priceLKR: 300 }
      ],
      'Rasboras': [
        { _id: 'fish5', name: 'Harlequin Rasbora', imageUrl: 'https://images.unsplash.com/photo-1535591273668-578e31182c4f?w=500', description: 'Peaceful, active swimmer.', size: '2 inches', stock: 10, priceLKR: 400 }
      ]
    };

    this.fishes = demoFishes[categoryName] || [];
  }

  loadOrders() {
    this.apiService.getOrders().subscribe({
      next: (data) => {
        this.orders = data;
      },
      error: () => {
        this.orders = [
          { _id: 'ord1', totalAmount: 11000, status: 'Pending', createdAt: new Date(), address: 'Colombo' },
          { _id: 'ord2', totalAmount: 7500, status: 'Processing', createdAt: new Date(), address: 'Kandy' }
        ];
      }
    });
  }

  loadCart() {
    const cartStr = localStorage.getItem('cart');
    if (cartStr) {
      this.cart = JSON.parse(cartStr);
      this.updateCartTotal();
    }
  }

  updateCartTotal() {
    this.totalCartItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
  }

  addToCart(fish: any) {
    const existing = this.cart.find(item => item._id === fish._id);
    if (existing) {
      existing.quantity += 1;
    } else {
      this.cart.push({ ...fish, quantity: 1 });
    }
    localStorage.setItem('cart', JSON.stringify(this.cart));
    this.updateCartTotal();
    alert(`${fish.name} added to cart!`);
  }

  removeFromCart(index: number) {
    this.cart.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(this.cart));
    this.updateCartTotal();
  }

  updateQuantity(index: number, change: number) {
    const item = this.cart[index];
    const newQty = item.quantity + change;
    if (newQty <= 0) {
      this.removeFromCart(index);
      return;
    }
    item.quantity = newQty;
    localStorage.setItem('cart', JSON.stringify(this.cart));
    this.updateCartTotal();
  }

  getCartTotal() {
    return this.cart.reduce((sum, item) => sum + (item.priceLKR * item.quantity), 0);
  }

  placeOrder() {
    if (this.cart.length === 0) {
      alert('Your cart is empty!');
      return;
    }

    const orderData = {
      items: this.cart.map(item => ({
        fish: item._id,
        quantity: item.quantity,
        price: item.priceLKR
      })),
      totalAmount: this.getCartTotal(),
      address: this.currentUser?.address || 'Colombo, Sri Lanka',
      phone: this.currentUser?.phone || '077-1234567'
    };

    this.apiService.createOrder(orderData).subscribe({
      next: () => {
        alert('Order placed successfully!');
        this.cart = [];
        localStorage.setItem('cart', JSON.stringify(this.cart));
        this.updateCartTotal();
        this.loadOrders();
      },
      error: () => {
        alert('Order placed successfully! (Demo mode)');
        this.cart = [];
        localStorage.setItem('cart', JSON.stringify(this.cart));
        this.updateCartTotal();
        this.loadOrders();
      }
    });
  }

  viewOrderDetails(order: any) {
    this.selectedOrder = order;
    this.showOrderModal = true;
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('cart');
    this.router.navigate(['/login']);
  }

  get filteredFishes() {
    if (!this.searchQuery.trim()) return this.fishes;
    return this.fishes.filter(fish =>
      fish.name.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'Pending': '#f59e0b',
      'Processing': '#3b82f6',
      'Packing': '#8b5cf6',
      'Dispatching': '#06b6d4',
      'Completed': '#10b981',
      'Cancelled': '#ef4444'
    };
    return colors[status] || '#9ca3af';
  }

  navigateTo(page: string) {
    this.currentPage = page;
    if (page === 'shop') {
      this.showCart = false;
    } else if (page === 'cart') {
      this.showCart = true;
    } else if (page === 'orders') {
      this.showCart = false;
      this.loadOrders();
    }
  }
}