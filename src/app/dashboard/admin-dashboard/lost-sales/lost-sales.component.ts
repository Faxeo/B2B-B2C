import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ChartConfiguration, ChartTypeRegistry } from 'chart.js/auto';
import Chart from 'chart.js/auto';


// Interface for lost sales data
interface LostSale {
  id: number;
  timestamp: Date;
  partNumber: string;
  partDescription: string;
  category: string;
  searchCount: number;
  estimatedPrice: number;
  potentialRevenue: number;
  customerId?: string;
  sessionId?: string;
}

@Component({
    selector: 'app-lost-sales',
    imports: [CommonModule, FormsModule,
        // TODO: `HttpClientModule` should not be imported into a component directly.
        // Please refactor the code to add `provideHttpClient()` call to the provider list in the
        // application bootstrap logic and remove the `HttpClientModule` import from this component.
        HttpClientModule],
    templateUrl: './lost-sales.component.html',
    styleUrl: './lost-sales.component.css'
})
export class LostSalesComponent implements OnInit {
  // Chart instances
  // private trendChart: Chart<keyof ChartTypeRegistry> | null = null;
  // private categoriesChart: Chart<keyof ChartTypeRegistry> | null = null;
  private trendChart: any = null;
private categoriesChart: any = null;


  // Filter params
  selectedDateRange: string = 'week';
  startDate: string = '';
  endDate: string = '';
  searchQuery: string = '';

  // Pagination params
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 1;

  // Data
  lostSales: LostSale[] = [];
  pagedLostSales: LostSale[] = [];
  
  // Stats
  totalLostSales: number = 0;
  estimatedRevenueLoss: number = 0;
  mostRequestedCount: number = 0;
  uniqueCustomersAffected: number = 0;

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    // Set default date range (last 7 days)
    const today = new Date();
    const lastWeek = new Date();
    lastWeek.setDate(today.getDate() - 7);
    
    this.startDate = this.formatDate(lastWeek);
    this.endDate = this.formatDate(today);
    
    // Load initial data
    this.loadLostSalesData();
  }

  // Format date to YYYY-MM-DD
  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Load lost sales data from API
  loadLostSalesData(): void {
    // In a real application, this would be an API call
    // For demo purposes, we'll generate mock data
    this.generateMockData();
    
    // Calculate stats
    this.calculateStats();
    
    // Update pagination
    this.updatePagination();
    
    // Initialize charts
    setTimeout(() => {
      this.initCharts();
    }, 100);
  }

  onDateRangeChange(): void {
    // if they picked "Custom", we let the <div *ngIf> show and wait for Apply
    if (this.selectedDateRange === 'custom') {
      return;
    }

    const today = new Date();
    let start = new Date();

    switch (this.selectedDateRange) {
      case 'today':
        // same-day range
        start = new Date();
        break;
      case 'week':
        start.setDate(today.getDate() - 7);
        break;
      case 'month':
        start.setDate(today.getDate() - 30);
        break;
      case 'quarter':
        start.setDate(today.getDate() - 90);
        break;
    }

    // format for the built-in <input type="date">
    this.startDate = this.formatDate(start);
    this.endDate   = this.formatDate(today);

    // re-filter, re-paginate, re-draw
    this.updatePagination();
    this.initCharts();
  }

  // Generate mock data for demonstration
  generateMockData(): void {
    const categories = ['Engine Parts', 'Electrical Components', 'Suspension', 'Brakes', 'Transmission', 'Accessories'];
    const mockData: LostSale[] = [];
    
    for (let i = 1; i <= 87; i++) {
      const randomDaysAgo = Math.floor(Math.random() * 30);
      const date = new Date();
      date.setDate(date.getDate() - randomDaysAgo);
      
      const searchCount = Math.floor(Math.random() * 20) + 1;
      const estimatedPrice = Math.floor(Math.random() * 500) + 50;
      
      mockData.push({
        id: i,
        timestamp: date,
        partNumber: `P${Math.floor(1000 + Math.random() * 9000)}`,
        partDescription: `Auto part ${i} description`,
        category: categories[Math.floor(Math.random() * categories.length)],
        searchCount: searchCount,
        estimatedPrice: estimatedPrice,
        potentialRevenue: searchCount * estimatedPrice,
        customerId: Math.random() > 0.5 ? `CUST${Math.floor(1000 + Math.random() * 9000)}` : undefined,
        sessionId: `SESSION${Math.floor(10000 + Math.random() * 90000)}`
      });
    }
    
    this.lostSales = mockData;
  }

  // Calculate summary statistics
  calculateStats(): void {
    this.totalLostSales = this.lostSales.reduce((sum, item) => sum + item.searchCount, 0);
    this.estimatedRevenueLoss = this.lostSales.reduce((sum, item) => sum + item.potentialRevenue, 0);
    
    // Find most requested item count
    this.mostRequestedCount = Math.max(...this.lostSales.map(item => item.searchCount));
    
    // Count unique customers
    const uniqueCustomers = new Set(
      this.lostSales
        .filter(item => item.customerId)
        .map(item => item.customerId)
    );
    this.uniqueCustomersAffected = uniqueCustomers.size;
  }

  // Initialize charts
  initCharts(): void {
    this.initTrendChart();
    this.initCategoriesChart();
  }

  // Initialize trend chart
  initTrendChart(): void {
    // Destroy existing chart if it exists
    if (this.trendChart) {
      this.trendChart.destroy();
    }

    // Group data by date
    const dateMap = new Map<string, number>();
    this.lostSales.forEach(sale => {
      const dateStr = this.formatDate(new Date(sale.timestamp));
      const currentCount = dateMap.get(dateStr) || 0;
      dateMap.set(dateStr, currentCount + sale.searchCount);
    });

    // Sort dates
    const sortedDates = Array.from(dateMap.keys()).sort();
    
    // Prepare chart data
    const chartData = {
      labels: sortedDates,
      datasets: [{
        label: 'Lost Sales Count',
        data: sortedDates.map(date => dateMap.get(date) || 0),
        borderColor: '#3366cc',
        backgroundColor: 'rgba(51, 102, 204, 0.1)',
        borderWidth: 2,
        tension: 0.2,
        fill: true
      }]
    };

    // Get canvas context
    const ctx = document.getElementById('lostSalesTrend') as HTMLCanvasElement;
    if (!ctx) return;

    // Create chart
    this.trendChart = new Chart(ctx, {
      type: 'line',
      data: chartData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
          },
          title: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Count'
            }
          },
          x: {
            title: {
              display: true,
              text: 'Date'
            }
          }
        }
      }
    } as ChartConfiguration<'line'>);
  }

  // Initialize categories chart
  initCategoriesChart(): void {
    // Destroy existing chart if it exists
    if (this.categoriesChart) {
      this.categoriesChart.destroy();
    }

    // Group data by category
    const categoryMap = new Map<string, number>();
    this.lostSales.forEach(sale => {
      const currentCount = categoryMap.get(sale.category) || 0;
      categoryMap.set(sale.category, currentCount + sale.searchCount);
    });

    // Sort categories by count (descending)
    const sortedCategories = Array.from(categoryMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5); // Top 5 categories

    // Prepare chart data
    const chartData = {
      labels: sortedCategories.map(item => item[0]),
      datasets: [{
        label: 'Search Count',
        data: sortedCategories.map(item => item[1]),
        backgroundColor: [
          '#3366cc', '#dc3912', '#ff9900', '#109618', '#990099'
        ],
        borderWidth: 1
      }]
    };

    // Get canvas context
    const ctx = document.getElementById('categoriesChart') as HTMLCanvasElement;
    if (!ctx) return;

    // Create chart
    this.categoriesChart = new Chart(ctx, {
      type: 'doughnut',
      data: chartData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right'
          }
        }
      }
    } as ChartConfiguration<'doughnut'>);
  }

  // Update pagination
  updatePagination(): void {
    // Apply filters to data
    const filteredData = this.filterData();
    
    // Calculate total pages
    this.totalPages = Math.ceil(filteredData.length / this.itemsPerPage);
    
    // Get current page data
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.pagedLostSales = filteredData.slice(startIndex, endIndex);
    
    // Reset page if current page is out of bounds
    if (this.currentPage > this.totalPages && this.totalPages > 0) {
      this.goToPage(1);
    }
  }

  // Filter data based on date range and search query
  filterData(): LostSale[] {
    let filteredData = this.lostSales;
    
    // Apply date filter
    if (this.startDate && this.endDate) {
      const startDate = new Date(this.startDate);
      const endDate = new Date(this.endDate);
      endDate.setHours(23, 59, 59, 999); // End of day
      
      filteredData = filteredData.filter(item => {
        const itemDate = new Date(item.timestamp);
        return itemDate >= startDate && itemDate <= endDate;
      });
    }
    
    // Apply search filter
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filteredData = filteredData.filter(item => 
        item.partNumber.toLowerCase().includes(query) ||
        item.partDescription.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query)
      );
    }
    
    return filteredData;
  }

  // Apply filter when date range changes
  applyCustomDateFilter(): void {
    this.updatePagination();
    this.initCharts();
  }

  // Apply search filter
  filterResults(): void {
    this.currentPage = 1; // Reset to first page
    this.updatePagination();
    this.initCharts();
  }

  // Sort data by column
  sortBy(column: keyof LostSale): void {
    // Implement sorting logic here
    this.lostSales.sort((a, b) => {
      const valueA = a[column] ?? '';
      const valueB = b[column] ?? '';
      
      if (valueA < valueB) return -1;
      if (valueA > valueB) return 1;
      return 0;
    });
    
    this.updatePagination();
  }

  // Go to specific page
  goToPage(page: number): void {
    this.currentPage = page;
    this.updatePagination();
  }

  // Generate array for page numbers
  getPageArray(): number[] {
    const pages: number[] = [];
    const totalPagesToShow = 5;
    
    if (this.totalPages <= totalPagesToShow) {
      // Show all pages
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show a range around current page
      let startPage = Math.max(1, this.currentPage - 2);
      let endPage = Math.min(this.totalPages, startPage + totalPagesToShow - 1);
      
      // Adjust if we're near the end
      if (endPage - startPage < totalPagesToShow - 1) {
        startPage = Math.max(1, endPage - totalPagesToShow + 1);
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  }

  // Export data to CSV
  exportData(): void {
    const filteredData = this.filterData();
    
    // Create CSV content
    let csvContent = 'Date/Time,Part Number,Description,Category,Search Count,Est. Price,Potential Revenue\n';
    
    filteredData.forEach(item => {
      csvContent += `${new Date(item.timestamp).toLocaleString()},`;
      csvContent += `${item.partNumber},`;
      csvContent += `"${item.partDescription}",`;
      csvContent += `${item.category},`;
      csvContent += `${item.searchCount},`;
      csvContent += `${item.estimatedPrice.toFixed(2)},`;
      csvContent += `${item.potentialRevenue.toFixed(2)}\n`;
    });
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `lost_sales_report_${this.formatDate(new Date())}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Add to inventory action
  addToInventory(item: LostSale): void {
    console.log('Add to inventory:', item);
    // Implement integration with inventory system
    alert(`Part ${item.partNumber} has been added to procurement list.`);
  }

  // Find alternatives action
  findAlternatives(item: LostSale): void {
    console.log('Find alternatives for:', item);
    // Implement search for alternative products
    alert(`Searching for alternatives to ${item.partNumber}...`);
  }
}