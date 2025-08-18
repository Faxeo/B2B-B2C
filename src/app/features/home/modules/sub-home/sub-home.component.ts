import {
  Component,
  OnInit,
  AfterViewInit,
  QueryList,
  ViewChildren,
  ElementRef,
  NgZone,
  ChangeDetectorRef,
} from '@angular/core';
import { Observable, forkJoin, of } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { ApiService } from '../../../../shared/api.service';
import { CommonModule } from '@angular/common';
import { FooterComponent } from '../../../../layout/footer/footer.component';

@Component({
    imports: [CommonModule, FooterComponent],
    selector: 'app-sub-home',
    templateUrl: './sub-home.component.html',
    styleUrls: ['./sub-home.component.css']
})
export class SubHomeComponent implements OnInit, AfterViewInit {
  @ViewChildren('subcatList') subcatLists!: QueryList<ElementRef>;

  categories$: Observable<any[]>;
  scrollStates: {
    [key: number]: { canScrollLeft: boolean; canScrollRight: boolean };
  } = {};

  constructor(
    private apiService: ApiService,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
  ) {
    this.categories$ = this.apiService.getMainCategory().pipe(
      switchMap((categories: any[]) => {
        const categoriesWithImages = categories.map((category: any) => ({
          ...category,
          image: `assets/car-parts-&-accessories.png`,
        }));

        const subCategories$ = forkJoin(
          categoriesWithImages.map((category: any) =>
            this.apiService
              .getSubCategories(category.id)
              .pipe(map((subCategories) => ({ [category.id]: subCategories })))
          )
        ).pipe(
          map((subCategoriesArray) =>
            subCategoriesArray.reduce(
              (acc, subCategory) => ({ ...acc, ...subCategory }),
              {}
            )
          )
        );

        return forkJoin({
          categories: of(categoriesWithImages),
          subCategories: subCategories$,
        });
      }),
      map(({ categories, subCategories }) => {
        return categories.map((category: any) => ({
          ...category,
          subCategories: subCategories[category.id] || [],
        }));
      }),
      tap((categories) => {
        categories.forEach((category) => {
          this.scrollStates[category.id] = {
            canScrollLeft: false,
            canScrollRight: false, // We'll update this after view init
          };
        });
      })
    );
  }

  ngOnInit() {}

  ngAfterViewInit() {
    this.ngZone.runOutsideAngular(() => {
      setTimeout(() => {
        this.updateAllScrollStates();
        this.cdr.detectChanges();
      });
    });

    this.subcatLists.changes.subscribe(() => {
      this.ngZone.runOutsideAngular(() => {
        setTimeout(() => {
          this.updateAllScrollStates();
          this.cdr.detectChanges();
        });
      });
    });
  }

  updateAllScrollStates() {
    this.subcatLists.forEach((list: ElementRef) => {
      const element = list.nativeElement;
      const categoryId = parseInt(element.id.split('-')[1], 10);
      this.updateScrollState(categoryId, element);
    });
  }

  scrollLeft(categoryId: number) {
    const subcatList = document.getElementById(`subcat-${categoryId}`);
    if (subcatList) {
      subcatList.scrollLeft -= 200;
      this.updateScrollState(categoryId, subcatList);
      this.cdr.detectChanges();
    }
  }

  scrollRight(categoryId: number) {
    const subcatList = document.getElementById(`subcat-${categoryId}`);
    if (subcatList) {
      subcatList.scrollLeft += 200;
      this.updateScrollState(categoryId, subcatList);
      this.cdr.detectChanges();
    }
  }

  updateScrollState(categoryId: number, element: HTMLElement) {
    const canScrollLeft = element.scrollLeft > 0;
    const canScrollRight =
      Math.ceil(element.scrollWidth) >
      Math.ceil(element.clientWidth + element.scrollLeft);

    this.scrollStates[categoryId] = { canScrollLeft, canScrollRight };
  }
}
