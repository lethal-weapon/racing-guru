import {Component, OnInit} from '@angular/core';

import {DESIGN_SECTIONS} from './design';
import {ACCOUNT_SPECIFICATIONS} from './account';
import {GOLD_PACKAGES, PRICING_SPECIFICATIONS} from './pricing';
import {STORAGE_USAGES, StorageUsage, StorageUsageItem} from './storage';
import {GAME_POINT_TABLE_SPECS, GAME_REWARD_SPECS, GAME_REWARDS, GAME_RULE_SPECS} from './game';
import {MAX_RACE_PER_MEETING, TWELVE_SECONDS} from '../util/numbers';
import {ODDS_INTENSITIES, PLACING_MAPS} from '../util/strings';

const POSTMAN_PROCESS_TIME_PER_CALL_MILL = 20;
const SECTIONS: string[] = [
  'Storage',
  'Sync Rate',
  'New Design',
  'Game',
  'Pricing',
  'Account',
  'Seminar',
  'Feedback',
  'Announcement',
]

@Component({
  selector: 'app-work-in-progress',
  templateUrl: './work-in-progress.component.html'
})
export class WorkInProgressComponent implements OnInit {

  activeSection: string = SECTIONS[5];

  protected readonly SECTIONS = SECTIONS;
  protected readonly MAX_RACE_PER_MEETING = MAX_RACE_PER_MEETING;
  protected readonly PLACING_MAPS = PLACING_MAPS;
  protected readonly ODDS_INTENSITIES = ODDS_INTENSITIES;
  protected readonly POSTMAN_PROCESS_TIME_PER_CALL_MILL = POSTMAN_PROCESS_TIME_PER_CALL_MILL;
  protected readonly DESIGN_SECTIONS = DESIGN_SECTIONS;
  protected readonly GAME_RULE_SPECS = GAME_RULE_SPECS;
  protected readonly GAME_REWARD_SPECS = GAME_REWARD_SPECS;
  protected readonly GAME_REWARDS = GAME_REWARDS;
  protected readonly GAME_POINT_TABLE_SPECS = GAME_POINT_TABLE_SPECS;
  protected readonly GOLD_PACKAGES = GOLD_PACKAGES;
  protected readonly PRICING_SPECIFICATIONS = PRICING_SPECIFICATIONS;
  protected readonly ACCOUNT_SPECIFICATIONS = ACCOUNT_SPECIFICATIONS;
  protected readonly parseInt = parseInt;

  constructor() {
  }

  ngOnInit(): void {
  }

  getRunnerDelay = (remainingRaces: number): number =>
    TWELVE_SECONDS / (2 * remainingRaces) - POSTMAN_PROCESS_TIME_PER_CALL_MILL

  getStorageItemValue = (item: StorageUsageItem, field: string): string => {
    // @ts-ignore
    return item[field].toString();
  }

  getStorageStat = (field: string): number => {
    if (field === 'collection') return 0;
    if (field === 'avgDocumentSize') return 0;

    if (field === 'documents') {
      return this.storageUsageItems
        .map(i => i.documents)
        .reduce((prev, curr) => prev + curr, 0);
    }
    if (field.includes('Size')) {
      const sizeInKiB = this.storageUsageItems
        .map(i => {
          if (field === 'totalDocumentSize') return i.totalDocumentSize;
          if (field === 'totalIndexSize') return i.totalIndexSize;
          return '0 KiB';
        })
        .map(size => {
          if (size.includes('KiB')) return parseFloat(size.replace('KiB', ''));
          if (size.includes('MiB')) return 1024 * parseFloat(size.replace('MiB', ''));
          return 0;
        })
        .reduce((prev, curr) => prev + curr, 0);

      return parseFloat((sizeInKiB / 1024).toFixed(1));
    }
    return 0;
  }

  getSectionStyle = (section: string): string =>
    this.activeSection === section
      ? `font-bold bg-gradient-to-r from-sky-800 to-indigo-800`
      : `bg-gray-800 border border-gray-800 hover:border-gray-600 cursor-pointer`

  get storageItemFields(): string[] {
    return [
      'collection',
      'documents',
      'avgDocumentSize',
      'totalDocumentSize',
      'totalIndexSize',
    ]
  }

  get syncRateFields(): string[] {
    return [
      'Races Remaining',
      'Calls Needed',
      'Postman Runner Interval Delay Between Call',
    ]
  }

  get storageUsageItems(): StorageUsageItem[] {
    return this.storageUsage.items.sort((i1, i2) => i2.documents - i1.documents);
  }

  get storageUsage(): StorageUsage {
    return STORAGE_USAGES[0];
  }
}
