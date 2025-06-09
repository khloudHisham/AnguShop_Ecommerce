import { Component, Input } from '@angular/core';
import { Chart, ChartConfiguration, ChartType, registerables } from 'chart.js';

@Component({
  selector: 'app-chart',
  standalone: true,
  template: `
    <div class="chart-container">
      <canvas [id]="chartId"></canvas>
    </div>
  `,
  styles: [`
    .chart-container {
      position: relative;
      height: 300px;
      width: 100%;
    }
  `]
})
export class ChartComponent {
  @Input() chartId!: string;
  @Input() config!: ChartConfiguration;
  
  private chart?: Chart;

  constructor() {
    Chart.register(...registerables);
  }

  ngAfterViewInit() {
    this.createChart();
  }

  ngOnChanges() {
    if (this.chart) {
      this.chart.destroy();
      this.createChart();
    }
  }

  private createChart() {
    const canvas = document.getElementById(this.chartId) as HTMLCanvasElement;
    if (canvas) {
      this.chart = new Chart(canvas, this.config);
    }
  }

  ngOnDestroy() {
    if (this.chart) {
      this.chart.destroy();
    }
  }
}