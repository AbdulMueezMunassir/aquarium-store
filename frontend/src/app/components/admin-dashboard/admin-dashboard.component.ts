import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  // Navigation
  currentPage: string = 'inventory';
  
  // User
  currentUser: any = null;
  
  // Categories
  categories: any[] = [];
  selectedCategory: any = null;
  
  // Fish
  fishes: any[] = [];
  allFishes: any[] = [];
  isLoading = false;
  errorMessage = '';
  searchQuery = '';
  
  // Stats
  totalFish = 0;
  totalCategories = 0;
  lowStockCount = 0;
  
  // Orders
  orders: any[] = [];
  
  // Modals
  showCategoryModal = false;
  showFishModal = false;
  showEditModal = false;
  showDeleteModal = false;
  showOrderModal = false;
  selectedFish: any = null;
  selectedOrder: any = null;
  
  // Form Data
  newCategoryName = '';
  newCategoryImage = '';
  newFish = {
    name: '',
    description: '',
    size: '',
    stock: 0,
    priceLKR: 0,
    imageUrl: '',
    categoryId: ''
  };
  editFish = {
    _id: '',
    name: '',
    description: '',
    size: '',
    stock: 0,
    priceLKR: 0,
    imageUrl: ''
  };

  // Threshold
  thresholdAlert: number = 5;

  // Map
  showMap = false;
  customerAddress = '';
  mapUrl = '';

  // Fish Images - Working URLs
  fishImages: { [key: string]: string } = {
    'Pearl Gourami': 'https://images.unsplash.com/photo-1615934555811-92b4504c53c4?w=500&h=350&fit=crop',
    'Honey Gourami': 'https://images.unsplash.com/photo-1524704654690-b56c05c78a02?w=500&h=350&fit=crop',
    'Blue Gourami': 'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=500&h=350&fit=crop',
    'Neon Tetra': 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=500&h=350&fit=crop',
    'Harlequin Rasbora': 'https://images.unsplash.com/photo-1535591273668-578e31182c4f?w=500&h=350&fit=crop',
    'Guppy': 'https://images.unsplash.com/photo-1535591273668-578e31182c4f?w=500&h=350&fit=crop',
    'Platy': 'https://images.unsplash.com/photo-1535591273668-578e31182c4f?w=500&h=350&fit=crop'
  };

  constructor(
    private apiService: ApiService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUser();
    this.loadCategories();
    this.loadOrders();
    this.loadThreshold();
  }

  // ===== USER =====
  loadUser() {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      this.currentUser = JSON.parse(userStr);
    }
  }

  logout() {
    if (confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      this.router.navigate(['/login']);
    }
  }

  // ===== NAVIGATION =====
  navigateTo(page: string) {
    this.currentPage = page;
    if (page === 'inventory') {
      this.loadCategories();
    } else if (page === 'orders') {
      this.loadOrders();
    } else if (page === 'all-fish') {
      this.loadAllFishes();
    }
  }

  // ===== LOAD DATA =====
  loadCategories() {
    this.isLoading = true;
    
    this.apiService.getCategories().subscribe({
      next: (data) => {
        this.categories = data;
        this.totalCategories = data.length;
        this.isLoading = false;
        if (this.categories.length > 0 && !this.selectedCategory) {
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
      { _id: 'demo1', name: 'Gourami', image: 'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=100&h=100&fit=crop' },
      { _id: 'demo2', name: 'Tetra', image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=100&h=100&fit=crop' },
      { _id: 'demo3', name: 'Rasboras', image: 'https://images.unsplash.com/photo-1535591273668-578e31182c4f?w=100&h=100&fit=crop' },
      { _id: 'demo4', name: 'Livebearers', image: 'https://images.unsplash.com/photo-1535591273668-578e31182c4f?w=100&h=100&fit=crop' }
    ];
    this.totalCategories = this.categories.length;
    if (this.categories.length > 0 && !this.selectedCategory) {
      this.selectCategory(this.categories[0]);
    }
  }

  loadAllFishes() {
    this.isLoading = true;
    this.apiService.getAllFishes().subscribe({
      next: (data) => {
        this.allFishes = data.map(f => ({
          ...f,
          imageUrl: f.imageUrl || this.getFishImage(f.name)
        }));
        this.totalFish = data.length;
        this.lowStockCount = data.filter(f => f.stock <= this.thresholdAlert).length;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.allFishes = this.fishes.map(f => ({
          ...f,
          imageUrl: f.imageUrl || this.getFishImage(f.name)
        }));
        this.totalFish = this.fishes.length;
        this.lowStockCount = this.fishes.filter(f => f.stock <= this.thresholdAlert).length;
      }
    });
  }

  loadOrders() {
    this.apiService.getOrders().subscribe({
      next: (data) => {
        this.orders = data;
      },
      error: () => {
        // Demo orders
        this.orders = [
          { 
            _id: 'ord1', 
            customer: { username: 'Ahmed' }, 
            totalAmount: 11000, 
            status: 'Pending', 
            createdAt: new Date(), 
            address: 'Colombo, Sri Lanka',
            items: [{ name: 'Pearl Gourami', quantity: 2, price: 450 }]
          },
          { 
            _id: 'ord2', 
            customer: { username: 'Sara' }, 
            totalAmount: 7500, 
            status: 'Processing', 
            createdAt: new Date(Date.now() - 86400000), 
            address: 'Kandy, Sri Lanka',
            items: [{ name: 'Honey Gourami', quantity: 1, price: 700 }]
          },
          { 
            _id: 'ord3', 
            customer: { username: 'John' }, 
            totalAmount: 3200, 
            status: 'Completed', 
            createdAt: new Date(Date.now() - 172800000), 
            address: 'Galle, Sri Lanka',
            items: [{ name: 'Neon Tetra', quantity: 10, price: 300 }]
          }
        ];
      }
    });
  }

  loadThreshold() {
    const saved = localStorage.getItem('thresholdAlert');
    if (saved) {
      this.thresholdAlert = parseInt(saved);
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
        this.fishes = data.map(f => ({
          ...f,
          imageUrl: f.imageUrl || this.getFishImage(f.name)
        }));
        this.updateStats();
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
        { _id: 'fish1', name: 'Pearl Gourami', description: 'Peaceful, community tank fish.', size: '4-5 inches', stock: 12, priceLKR: 450 },
        { _id: 'fish2', name: 'Honey Gourami', description: 'Very peaceful, a bit timid.', size: '2 inches', stock: 2, priceLKR: 700 },
        { _id: 'fish3', name: 'Blue Gourami', description: 'Semi-aggressive, colorful.', size: '5-6 inches', stock: 8, priceLKR: 200 }
      ],
      'Tetra': [
        { _id: 'fish4', name: 'Neon Tetra', description: 'Peaceful schooling fish.', size: '1.5 inches', stock: 20, priceLKR: 300 }
      ],
      'Rasboras': [
        { _id: 'fish5', name: 'Harlequin Rasbora', description: 'Peaceful, active swimmer.', size: '2 inches', stock: 10, priceLKR: 400 }
      ],
      'Livebearers': [
        { _id: 'fish6', name: 'Guppy', description: 'Colorful, livebearer.', size: '1.5 inches', stock: 25, priceLKR: 250 },
        { _id: 'fish7', name: 'Platy', description: 'Peaceful community fish.', size: '2 inches', stock: 18, priceLKR: 280 }
      ]
    };

    this.fishes = (demoFishes[categoryName] || []).map(f => ({
      ...f,
      imageUrl: this.getFishImage(f.name)
    }));
    this.updateStats();
  }

  getFishImage(name: string): string {
    return this.fishImages[name] || `https://picsum.photos/seed/${name.replace(/\s/g, '')}/500/350`;
  }

  updateStats() {
    this.totalFish = this.fishes.length;
    this.lowStockCount = this.fishes.filter(f => f.stock <= this.thresholdAlert).length;
  }

  // ===== SEARCH =====
  get filteredFishes() {
    if (!this.searchQuery.trim()) return this.fishes;
    return this.fishes.filter(fish => 
      fish.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      fish.description.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  // ===== THRESHOLD =====
  updateThreshold() {
    if (this.thresholdAlert < 1) {
      this.thresholdAlert = 1;
    }
    localStorage.setItem('thresholdAlert', this.thresholdAlert.toString());
    this.updateStats();
    alert(`Low stock threshold set to ${this.thresholdAlert}`);
  }

  // ===== CATEGORY CRUD =====
  saveCategory() {
    if (!this.newCategoryName.trim()) return;
    this.apiService.createCategory({ 
      name: this.newCategoryName,
      image: this.newCategoryImage || 'https://picsum.photos/seed/' + this.newCategoryName + '/100/100'
    }).subscribe({
      next: () => {
        this.loadCategories();
        this.showCategoryModal = false;
        this.newCategoryName = '';
        this.newCategoryImage = '';
      },
      error: () => {
        const newCat = { 
          _id: 'demo' + Date.now(), 
          name: this.newCategoryName,
          image: this.newCategoryImage || 'https://picsum.photos/seed/' + this.newCategoryName + '/100/100'
        };
        this.categories.push(newCat);
        this.totalCategories = this.categories.length;
        this.selectCategory(newCat);
        this.showCategoryModal = false;
        this.newCategoryName = '';
        this.newCategoryImage = '';
      }
    });
  }

  deleteCategory(category: any) {
    if (confirm(`Are you sure you want to delete "${category.name}"?`)) {
      this.apiService.deleteCategory(category._id).subscribe({
        next: () => {
          this.categories = this.categories.filter(c => c._id !== category._id);
          this.totalCategories = this.categories.length;
          if (this.categories.length > 0) {
            this.selectCategory(this.categories[0]);
          } else {
            this.selectedCategory = null;
            this.fishes = [];
          }
        },
        error: () => {
          this.categories = this.categories.filter(c => c._id !== category._id);
          this.totalCategories = this.categories.length;
          if (this.categories.length > 0) {
            this.selectCategory(this.categories[0]);
          } else {
            this.selectedCategory = null;
            this.fishes = [];
          }
        }
      });
    }
  }

  // ===== FISH CRUD =====
  addFish() {
    if (!this.newFish.name.trim()) {
      alert('Please enter fish name');
      return;
    }
    
    const fishData = {
      ...this.newFish,
      categoryId: this.selectedCategory._id,
      imageUrl: this.newFish.imageUrl || this.getFishImage(this.newFish.name)
    };
    
    this.apiService.addFish(fishData).subscribe({
      next: () => {
        this.selectCategory(this.selectedCategory);
        this.showFishModal = false;
        this.resetFishForm();
      },
      error: () => {
        const newFish = { 
          ...this.newFish, 
          _id: 'fish' + Date.now(),
          imageUrl: this.newFish.imageUrl || this.getFishImage(this.newFish.name)
        };
        this.fishes.push(newFish);
        this.updateStats();
        this.showFishModal = false;
        this.resetFishForm();
      }
    });
  }

  editFishDetails() {
    if (!this.editFish._id) return;
    
    this.apiService.updateFish(this.editFish._id, this.editFish).subscribe({
      next: () => {
        this.selectCategory(this.selectedCategory);
        this.showEditModal = false;
        this.selectedFish = null;
      },
      error: () => {
        const index = this.fishes.findIndex(f => f._id === this.editFish._id);
        if (index !== -1) {
          this.fishes[index] = { ...this.editFish };
          this.updateStats();
        }
        this.showEditModal = false;
        this.selectedFish = null;
      }
    });
  }

  deleteFish(fish: any) {
    this.selectedFish = fish;
    this.showDeleteModal = true;
  }

  confirmDelete() {
    if (!this.selectedFish) return;
    
    this.apiService.deleteFish(this.selectedFish._id).subscribe({
      next: () => {
        this.fishes = this.fishes.filter(f => f._id !== this.selectedFish._id);
        this.updateStats();
        this.showDeleteModal = false;
        this.selectedFish = null;
      },
      error: () => {
        this.fishes = this.fishes.filter(f => f._id !== this.selectedFish._id);
        this.updateStats();
        this.showDeleteModal = false;
        this.selectedFish = null;
      }
    });
  }

  openEditModal(fish: any) {
    this.selectedFish = fish;
    this.editFish = { ...fish };
    this.showEditModal = true;
  }

  resetFishForm() {
    this.newFish = {
      name: '',
      description: '',
      size: '',
      stock: 0,
      priceLKR: 0,
      imageUrl: '',
      categoryId: ''
    };
  }

  // ===== STOCK MANAGEMENT =====
  updateStock(fish: any, change: number) {
    const newStock = fish.stock + change;
    if (newStock < 0) return;
    
    this.apiService.updateStock(fish._id, { stock: newStock }).subscribe({
      next: () => {
        fish.stock = newStock;
        this.updateStats();
      },
      error: () => {
        fish.stock = newStock;
        this.updateStats();
      }
    });
  }

  // ===== ORDERS =====
  updateOrderStatus(order: any, status: string) {
    this.apiService.updateOrderStatus(order._id, status).subscribe({
      next: () => {
        order.status = status;
      },
      error: () => {
        order.status = status;
      }
    });
  }

  viewOrderDetails(order: any) {
    this.selectedOrder = order;
    this.showOrderModal = true;
  }

  // ===== MAP =====
  openMap(address: string) {
    this.customerAddress = address || 'Colombo, Sri Lanka';
    this.mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=79.5,6.5,80.5,7.5&layer=mapnik&marker=${encodeURIComponent(address)}`;
    this.showMap = true;
  }

  closeMap() {
    this.showMap = false;
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
}