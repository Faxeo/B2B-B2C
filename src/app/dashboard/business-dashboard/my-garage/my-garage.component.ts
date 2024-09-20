import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FetchYearService } from '../../../core/services/fetch-year/fetch-year.service';
import { FetchMakeService } from '../../../core/services/fetch-make/fetch-make.service';
import { FetchChildService } from '../../../core/services/fetch-child/fetch-child.service';
import { CompatibleProductsService } from '../../../core/services/compatible-products/compatible-products.service';
import { EventEmitter } from '@angular/core';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  selector: 'app-my-garage',
  templateUrl: './my-garage.component.html',
  styleUrls: ['./my-garage.component.css'],
})
export class MyGarageComponent implements OnInit {
  years: { year: string }[] = [];
  makes: { name: string; cvalue_id: number }[] = [];
  models: { name: string; cvalue_id: number }[] = [];
  trims: { name: string; cvalue_id: number }[] = []; // Array for trims
  engines: { name: string }[] = [];
  compatibleProducts: any[] = [];
  allCompatibleProducts: any[] = []; // Store all fetched products
  getcompatibleProducts: any[] = []; // Products displayed on current page
  currentPage: number = 1; // Track current page
  pageSize: number = 5; // Number of products per page
  totalPages: number = 1; // Total number of pages

  selectedYear: string = '';
  selectedMake: string = '';
  selectedModel: string = '';
  selectedTrim: string = ''; // Variable for selected trim
  selectedEngine: string = '';

  @Output() formVisibilityChanged = new EventEmitter<boolean>();
  showVehicleForm: boolean = false;
  isLoading: boolean = false;
  demoVehicleData = [
    {
      year: '2018',
      make: 'SUBARU',
      model: 'LEGACY',
      trim: '3.6R Limited Sedan 4-Door',
      engine: '3.6L 3630CC H6 GAS DOHC Naturally Aspirated',
      products: [
        {
          name: 'OIL FILTER',
          partNumber: '1597845652',
          unitPrice: 9.89,
          totalPrice: 90,
          qty: '10 PCS',
        },
      ],
    },
    {
      year: '2006',
      make: 'SUBARU',
      model: 'LEGACY',
      trim: '3.6R Limited Sedan 4-Door',
      engine: '3.6L 3630CC H6 GAS DOHC Naturally Aspirated',
      products: [],
    },
  ];

  constructor(
    private fetchYearService: FetchYearService,
    private fetchMakeService: FetchMakeService,
    private fetchChildService: FetchChildService,
    private compatibleProductsService: CompatibleProductsService,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.getYears();
  }

  getYears(): void {
    this.fetchYearService.fetchYears().subscribe(
      (data: any[]) => {
        console.log('Fetched Years:', data);
        this.years = data.map((item) => ({ year: item.value_name }));
      },
      (error) => {
        console.error('Error fetching years:', error);
      }
    );
  }

  addVehicle(): void {
    this.showVehicleForm = true;
    this.formVisibilityChanged.emit(this.showVehicleForm);
  }

  closeVehicleForm(): void {
    // Reset form values
    this.selectedYear = '';
    this.selectedMake = '';
    this.selectedModel = '';
    this.selectedTrim = '';
    this.selectedEngine = '';
    page: this.currentPage,
    this.compatibleProducts = [];
    this.showVehicleForm = false;
    this.formVisibilityChanged.emit(this.showVehicleForm);
  }

  onYearChange(): void {
    if (this.selectedYear) {
      this.fetchMakeService.fetchMakes(this.selectedYear).subscribe(
        (data: any[]) => {
          console.log('Fetched Makes:', data);
          this.makes = data.map((item) => ({
            name: item.value_name,
            cvalue_id: item.cvalue_id,
          }));
          this.selectedMake = '';
          this.models = [];
          this.trims = [];
          this.engines = [];
          this.selectedModel = '';
          this.selectedTrim = '';
          this.selectedEngine = '';
        },
        (error) => {
          console.error('Error fetching makes:', error);
        }
      );
    }
  }

  onMakeChange(): void {
    if (this.selectedMake) {
      const selectedMakeObject = this.makes.find(
        (make) => make.name === this.selectedMake
      );
      const parentID = selectedMakeObject ? selectedMakeObject.cvalue_id : 0;

      this.fetchChildService.fetchChildren(parentID).subscribe(
        (data: any[]) => {
          console.log('Fetched Models:', data);
          this.models = data.map((item) => ({
            name: item.value_name,
            cvalue_id: item.cvalue_id,
          }));
          this.selectedModel = '';
          this.trims = [];
          this.engines = [];
          this.selectedTrim = '';
          this.selectedEngine = '';
          this.changeDetectorRef.detectChanges();
        },
        (error) => {
          console.error('Error fetching models:', error);
          alert(
            'Failed to fetch models. Please check the console for more details.'
          );
        }
      );
    }
  }

  onModelChange(): void {
    if (this.selectedModel) {
      const selectedModelObject = this.models.find(
        (model) => model.name === this.selectedModel
      );
      const modelID = selectedModelObject ? selectedModelObject.cvalue_id : 0;

      this.fetchChildService.fetchChildren(modelID).subscribe(
        (data: any[]) => {
          console.log('Fetched Trims:', data);
          this.trims = data.map((item) => ({
            name: item.value_name,
            cvalue_id: item.cvalue_id,
          }));
          this.selectedTrim = '';
          this.engines = [];
          this.selectedEngine = '';
          this.changeDetectorRef.detectChanges();
        },
        (error) => {
          console.error('Error fetching trims:', error);
          alert(
            'Failed to fetch trims. Please check the console for more details.'
          );
        }
      );
    }
  }

  onTrimChange(): void {
    if (this.selectedTrim) {
      const selectedTrimObject = this.trims.find(
        (trim) => trim.name === this.selectedTrim
      );
      const trimID = selectedTrimObject ? selectedTrimObject.cvalue_id : 0;

      this.fetchChildService.fetchChildren(trimID).subscribe(
        (data: any[]) => {
          console.log('Fetched Engines:', data);
          this.engines = data.map((item) => ({ name: item.value_name }));
          this.selectedEngine = '';
          this.changeDetectorRef.detectChanges();
        },
        (error) => {
          console.error('Error fetching engines:', error);
          alert(
            'Failed to fetch engines. Please check the console for more details.'
          );
        }
      );
    }
  }

  getCompatibleProducts(): void {
    this.isLoading = true;
    const requestData = {
        year: this.selectedYear,
        make: this.selectedMake,
        model: this.selectedModel,
        trim: this.selectedTrim,
        engine: this.selectedEngine,
        page: 1, // Always fetch all products starting at page 1
      pageSize: 1000, // Large page size to get all products in one go
        searchTerm: ''
    };

    console.log('Request Payload:', requestData);
    
    this.compatibleProductsService.getCompatibleProducts(requestData).subscribe(
      (data: any) => {
        console.log('Compatible Products:', data.products);
        this.allCompatibleProducts = data.products; // Store all products
        this.totalPages = Math.ceil(this.allCompatibleProducts.length / this.pageSize); // Calculate total pages
        this.displayProducts(); // Display first page
        this.isLoading = false; // Stop loading once data is fetched
        this.changeDetectorRef.detectChanges();
      },
      (error) => {
        console.error('Error fetching compatible products:', error);
        alert('Failed to fetch compatible products. Please check the console for more details.');
        this.isLoading = false; // Stop loading in case of an error
      }
    );
  }

  displayProducts(): void {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.compatibleProducts = this.allCompatibleProducts.slice(start, end); // Show the current page's products
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.displayProducts(); // Fetch and display products for the next page
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.displayProducts(); // Fetch and display products for the previous page
    }

  }

}
