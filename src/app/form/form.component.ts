import {Component, OnInit} from '@angular/core';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html'
})
export class FormComponent implements OnInit {
  activeSection: string = this.sections[0];

  constructor() {
  }

  ngOnInit(): void {
  }

  getSectionStyle = (section: string): string =>
    this.activeSection === section
      ? `font-bold bg-gradient-to-r from-sky-800 to-indigo-800`
      : `bg-gray-800 border border-gray-800 hover:border-gray-600 cursor-pointer`;

  get sections(): string[] {
    return ['Notes', 'Owners', 'Bets', 'People', 'Fixture'];
  }
}