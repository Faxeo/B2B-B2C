import { Component, ElementRef, OnInit, ViewChild, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-order-summary',
  templateUrl: './order-summary.component.html',
  styleUrls: ['./order-summary.component.css'],
  standalone: true
})
export class OrderSummaryComponent implements OnInit {
  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;
  chart: Chart | undefined;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit() {}

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.createChart();
    }
  }

  createChart() {
    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (ctx) {
      this.chart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['Pending Orders', 'Completed Orders', 'In Process Orders'],
          datasets: [{
            label: 'Order Status',
            data: [10, 25, 15],
            backgroundColor: [
              'rgba(255, 99, 132, 0.2)',
              'rgba(54, 162, 235, 0.2)',
              'rgba(75, 192, 192, 0.2)'
            ],
            borderColor: [
              'rgba(255, 99, 132, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(75, 192, 192, 1)'
            ],
            borderWidth: 1
          }]
        },
        options: {
          scales: {
            y: {
              beginAtZero: true
            }
          },
          plugins: {
            legend: {
              onClick: (evt, item, legend) => {
                const index = item.datasetIndex;
                if (index !== undefined) {
                  const ci = legend.chart;

                  const clickedItemVisible = ci.isDatasetVisible(index);

                  ci.setDatasetVisibility(index, !clickedItemVisible);

                  if (!clickedItemVisible) {
                    ci.data.datasets.forEach((dataset, i) => {
                      if (i !== index) {
                        ci.setDatasetVisibility(i, false);
                      }
                    });
                  }

                  ci.update();
                }
              }
            },
            title: {
              display: true,
              text: 'Order Summary'
            }
          }
        }
      });
    }
  }
}
