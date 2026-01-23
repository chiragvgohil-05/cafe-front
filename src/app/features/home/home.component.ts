import { Component } from '@angular/core';
import { Hero } from '../../shared/components/hero/hero.component';
import { Features } from '../../shared/components/features/features.component';
import { MenuHighlight } from '../../shared/components/menu-highlight/menu-highlight.component';
import { Story } from '../../shared/components/story/story.component';
import { Cta } from '../../shared/components/cta/cta.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [Hero, Features, MenuHighlight, Story, Cta],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class Home {

}
