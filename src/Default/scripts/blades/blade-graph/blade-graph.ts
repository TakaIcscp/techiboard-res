import { Blade, BladeSize } from '../../components/app-blade/blade';

import * as html from './blade-graph.html';
import './blade-graph.css';
import { TechboardApi } from '../../common/api/techboard-api';

export interface IBladeGraphParams 
{
}

declare var Raphael: any;

// to do: raphael vector graph testing ground
export class BladeGraph extends Blade<IBladeGraphParams> 
{
   public techboardApi: TechboardApi = new TechboardApi();

   public paper;
   public tooltip;

   // % out of 100 from bottom to top
   public values = [0, 20, 50, 50, 80, 80, 100, 90, 40, 30, 20, 10, 0, 0, 0];

   // how a circle point looks
   public pointOptions = 
   {
      'fill': 'white',
      'stroke' : '#4ab1ff',
      'stroke-width': 5,
      'radius' : 6,
      'cursor': 'pointer'
   }

   // how a line between circles looks
   public lineOptions = 
   {
      'stroke': '#4ab1ff',
      'stroke-width': 5,
   }

   public maxXValue = this.values.length;
   public minXValue = 0;
   public maxYValue = Math.max.apply(null, this.values);
   public minYValue = Math.min.apply(null, this.values);

   public chartWidth = 600;
   public chartHeight = 300;
   public margin = 12;
   public xStartPos = this.margin;
   public yStartPos = this.chartHeight - this.margin;
   public xFactor = this.maxXValue != 0 ? (this.chartWidth - this.margin * 2) / (this.maxXValue) : 1;
   public yFactor = this.maxYValue != 0 ? (this.chartHeight - this.margin * 2) / (this.maxYValue) : 1;

   constructor() 
   {
      super();

      this.html = html;
      this.title('Graph');
      this.size(BladeSize.Medium);

      this.canMaximize(false);
   }

   public dispose(): void 
   {
      super.dispose();
   }

   public async refreshBlade(params: IBladeGraphParams) 
   {
      super.refreshBlade(params);
   }

   public onLoad(): void
   {
      let This = this;
      function drawPoints(points, options) 
      {
         let radius = options.radius;
     
         points.forEach((point, i) => 
         {
             let xPos = This.xStartPos + This.xFactor * i;
             let yPos = This.yStartPos - point * This.yFactor;
             let node = This.paper.circle(xPos, yPos, radius).attr(options);

             let nodeGlow = This.paper.circle(xPos, yPos, radius)
             .attr
             ({
                 'fill': '#4ab1ff',
                 'opacity': .2,
                 'stroke': 'none',
                 radius : 6
             }).toBack();

             node.mouseover(() =>
             {
                 nodeGlow.animate({ r: 6 * 2.5 }, 200, '>');
                 let {x, y} = node.getBBox();
                 This.tooltip.style.marginLeft = (x + 30) + 'px';
                 This.tooltip.style.marginTop = (y + 15) + 'px';
                 This.tooltip.style.visibility = 'visible';
             })
             .mouseout(() =>
             {
                 nodeGlow.animate({r: 6}, 200, '<');
                 This.tooltip.style.visibility = 'hidden';
             })
         });
     }
     
     function createPathString(points) 
     {
         return points.reduce((p, point, i) => p += ` ${i ? 'L' : 'M'} ${This.xStartPos + This.xFactor*i} ${This.yStartPos - point*This.yFactor}`, ``);
     }

      this.tooltip = document.getElementById("tooltip");

      let sheetDiv = document.getElementById("paper-section");
      this.paper = Raphael("paper-section", 
         sheetDiv.clientWidth, 
         sheetDiv.clientHeight);

      this.paper.path(createPathString(this.values)).attr(this.lineOptions);
      drawPoints(this.values, this.pointOptions);
   }
}
