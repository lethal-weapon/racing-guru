import {Component, OnInit} from '@angular/core';

import {RestRepository} from '../../model/rest.repository';
import {PLACING_MAPS, SEASONS} from '../../util/strings';
import {
  DividendStarter,
  ConnectionDividend,
  DEFAULT_DIVIDEND_STARTER
} from '../../model/connection.model';

@Component({
  selector: 'app-form-connection',
  templateUrl: './form-connection.component.html'
})
export class FormConnectionComponent implements OnInit {
  currentPage: number = 1;

  protected readonly PLACING_MAPS = PLACING_MAPS;

  constructor(private repo: RestRepository) {
  }

  ngOnInit(): void {
    this.repo.fetchConnectionDividends();
  }

  formatMeeting = (meeting: string): string =>
    meeting.replace(/^\d{4}-/g, '')

  getDividendStarter = (dividend: ConnectionDividend, placing: number): DividendStarter =>
    dividend.starters.find(s => s.placing === placing) || DEFAULT_DIVIDEND_STARTER

  getDistantPair = (dividend: ConnectionDividend, dpi: number): string => {
    if (dividend.distantPairs.length < dpi) return '';

    return dividend.distantPairs[dpi - 1]
      .map(o => dividend.starters.find(s => s.order === o) || DEFAULT_DIVIDEND_STARTER)
      .sort((s1, s2) => s1.placing - s2.placing)
      .map(s => PLACING_MAPS[s.placing - 1].placing)
      .join(' / ');
  }

  handlePagingControls = (control: string) => {
    switch (control) {
      case 'First': {
        this.currentPage = 1;
        break;
      }
      case 'Prev': {
        if (this.currentPage > 1) {
          this.currentPage -= 1;
        }
        break;
      }
      case 'Next': {
        if (this.currentPage < this.maxPage) {
          this.currentPage += 1;
        }
        break;
      }
      case 'Last': {
        this.currentPage = this.maxPage;
        break;
      }
      default:
        break;
    }
  }

  get distantPairRatios(): number[] {
    const dpDividends = this.dividends.filter(d => d.distantPairs.length > 0);
    const dpPlacingRepr = dpDividends.map(d =>
      d.distantPairs
        .flatMap(ol => ol)
        .map(o => d.starters.find(s => s.order === o) || DEFAULT_DIVIDEND_STARTER)
        .map(s => PLACING_MAPS[s.placing - 1].placing)
        .join()
    );

    return [
      dpDividends.length / this.dividends.length,
      ...PLACING_MAPS.map(pm =>
        dpPlacingRepr.filter(r => r.includes(pm.placing)).length / dpDividends.length
      )
    ];
  }

  get pagingControls(): string[] {
    return ['First', 'Prev', 'Next', 'Last'];
  }

  get pagingControlStyle(): string {
    return `mx-auto px-4 pt-1.5 pb-2 text-xl rounded-full cursor-pointer 
            border border-gray-600 hover:border-yellow-400`;
  }

  get maxPage(): number {
    return Math.ceil(this.meetings.length / 2);
  }

  get meetings(): string[] {
    return this.dividends
      .map(d => d.meeting)
      .filter((m, i, arr) => i === arr.indexOf(m))
      .sort((m1, m2) => m2.localeCompare(m1));
  }

  get pagedDividends(): ConnectionDividend[] {
    const startIndex = 2 * (this.currentPage - 1);
    const pageMeetings = this.meetings.slice(startIndex, startIndex + 2);
    return this.dividends.filter(d => pageMeetings.includes(d.meeting));
  }

  get dividends(): ConnectionDividend[] {
    return this.repo
      .findConnectionDividends()
      .filter(d => d.meeting >= SEASONS[0].opening);
  }
}