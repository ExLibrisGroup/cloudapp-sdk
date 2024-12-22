import { Component, Input, OnInit } from "@angular/core";

@Component({
  selector: 'eca-menu-item',
  templateUrl: './menu-item.component.html',
  styleUrls: ['./menu-item.component.scss']
})
export class MenuItemComponent implements OnInit {

  @Input() title!: string;
  @Input() icon = 'uxf-icon uxf-check';
  @Input() routerLink!: string;

  ngOnInit() {
    
  }

}