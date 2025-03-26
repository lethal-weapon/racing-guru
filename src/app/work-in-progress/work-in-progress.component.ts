import {Component, OnInit} from '@angular/core';

import {RestRepository} from '../model/rest.repository';
import {STORAGE_USAGES, StorageUsage, StorageUsageItem} from "./storage";

const SECTIONS: string[] = [
  'Storage',
  'New Design',
]

@Component({
  selector: 'app-work-in-progress',
  templateUrl: './work-in-progress.component.html'
})
export class WorkInProgressComponent implements OnInit {

  activeSection: string = SECTIONS[0];

  protected readonly SECTIONS = SECTIONS;
  protected readonly STORAGE_USAGES = STORAGE_USAGES;

  constructor(private repo: RestRepository) {
  }

  ngOnInit(): void {
    // StorageUsageItem.
  }

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

  get storageUsageItems(): StorageUsageItem[] {
    return this.storageUsage.items.sort((i1, i2) => i2.documents - i1.documents);
  }

  get storageUsage(): StorageUsage {
    return STORAGE_USAGES[0];
  }
}
