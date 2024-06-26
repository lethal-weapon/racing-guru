import {Component, OnInit} from '@angular/core';
import {Clipboard} from '@angular/cdk/clipboard';

import {RestRepository} from '../../model/rest.repository';
import {Horse} from '../../model/horse.model';
import {Syndicate} from '../../model/syndicate.model';

@Component({
  selector: 'app-form-owner',
  templateUrl: './form-owner.component.html'
})
export class FormOwnerComponent implements OnInit {

  criteria: string = 'California';
  hoverHorse: string = '';
  activeSyndicate: Syndicate = {id: 0, members: [], horses: []};

  constructor(
    private repo: RestRepository,
    private clipboard: Clipboard
  ) {
  }

  ngOnInit(): void {
    this.repo.fetchHorses();
    this.repo.fetchSyndicates();
  }

  copyText = (text: string) =>
    this.clipboard.copy(text)

  getSyndicateMembers = (isTeam: boolean = false): string[] =>
    this.activeSyndicate.members
      .filter(m => isTeam ? m.includes('團體') : !m.includes('團體'))

  addSyndicate = () =>
    this.activeSyndicate = {id: 0, members: [], horses: []}

  deleteSyndicate = () => {
    if (this.activeSyndicate.id !== 0) {
      this.repo.deleteSyndicate(
        this.activeSyndicate,
        this.addSyndicate
      );
    }
  }

  saveSyndicate = () => {
    if (this.activeSyndicate.horses.length < 2) return;
    if (this.activeSyndicate.members.length < 1) return;

    this.repo.saveSyndicate(
      this.activeSyndicate,
      (saved: Syndicate) => this.activeSyndicate = saved
    );
  }

  isSyndicateHorse = (horse: Horse) =>
    this.activeSyndicate.horses.includes(horse.code)

  isBelongToOtherSyndicate = (horse: Horse) =>
    this.syndicates
      .filter(s => s.id !== this.activeSyndicate.id)
      .map(s => s.horses)
      .reduce((prev, curr) => prev.concat(curr), [])
      .includes(horse.code)

  goToSyndicate = (horse: Horse) => {
    if (this.isSyndicateHorse(horse)) return;
    if (this.isBelongToOtherSyndicate(horse)) {
      const target = this.syndicates.find(s => s.horses.includes(horse.code));
      if (!target) return;

      this.activeSyndicate = {
        id: target.id,
        members: [...target.members],
        horses: [...target.horses],
      };
    }
  }

  addToSyndicate = (horse: Horse) => {
    if (this.isSyndicateHorse(horse)) return;

    this.activeSyndicate.horses.push(horse.code);
    this.activeSyndicate.horses.sort((h1, h2) => h1.localeCompare(h2));

    this.cleanOwner(horse.ownerCH).forEach(o => {
      if (!this.activeSyndicate.members.includes(o)) {
        this.activeSyndicate.members.push(o);
        this.activeSyndicate.members.sort((o1, o2) => o1.localeCompare(o2));
      }
    });
  }

  removeFromSyndicate = (horse: Horse) => {
    if (!this.isSyndicateHorse(horse)) return;

    this.activeSyndicate.horses =
      this.activeSyndicate.horses.filter(h => h !== horse.code);

    this.activeSyndicate.members = this.horses
      .filter(h => this.activeSyndicate.horses.includes(h.code))
      .map(h => this.cleanOwner(h.ownerCH))
      .reduce((prev, curr) => prev.concat(curr), [])
      .filter((o, i, arr) => arr.indexOf(o) === i)
      .sort((o1, o2) => o1.localeCompare(o2));
  }

  horseSorter = (h1: Horse, h2: Horse): number => {
    const horse1 = h1.retired ? 1 : 0;
    const horse2 = h2.retired ? 1 : 0;
    return horse1 - horse2 || h1.code.localeCompare(h2.code);
  }

  cleanOwner = (raw: string): string[] => {
    if (raw.endsWith('等')) raw = raw.slice(0, raw.length - 1);

    this.titles.forEach(t => {
      while (raw.includes(t)) raw = raw.replace(t, '');
    })

    this.splitors.forEach(s => {
      while (raw.includes(s)) raw = raw.replace(s, '&');
    })

    return raw.split('&').map(o => o.trim()).filter(o => o.length > 0);
  }

  get splitors(): string[] {
    return ['與', '及', '、', '、', ','];
  }

  get titles(): string[] {
    return [
      'Mr & Mrs', 'MR & MRS', 'Mrs', '先生及夫人', '及夫人', '夫婦',
      '女士', '醫生', '博士', '爵士', '議員',
      '(董事)', '（董事）', '(名譽董事)', '（名譽董事）',
      '遺產執行人', '教授'
    ];
  }

  get controlButtonStyle(): string {
    return `
      px-2 pt-1.5 pb-2 text-lg rounded-lg hvr-grow-shadow
      cursor-pointer border border-gray-600 hover:border-yellow-400
    `
  }

  get syndicateLabel(): string {
    return this.activeSyndicate.id === 0
      ? `* New Syndicate *`
      : `Syndicate #${this.activeSyndicate.id}`;
  }

  get activeSyndicateHorses(): Horse[] {
    return this.horses
      .filter(h => this.activeSyndicate.horses.includes(h.code))
      .sort(this.horseSorter);
  }

  get displayHorses(): Horse[] {
    let matches = new Set<Horse>();
    const criteria = this.criteria.trim().toUpperCase();

    if (criteria.match(/^~~~/g) && criteria.length > 3) {
      const names = criteria.replace('~~~', '').split(' ').map(e => e.trim());
      this.horses
        .filter(h => names.some(n => h.ownerCH.toUpperCase().includes(n)))
        .forEach(h => matches.add(h));

    } else if (criteria.match(/^!!!$/g)) {
      this.horses
        .filter(h => !this.isSyndicateHorse(h))
        .filter(h => !this.isBelongToOtherSyndicate(h))
        .filter(h => this.horses.some(nh => {
          const owners = this.cleanOwner(h.ownerCH);
          const otherOwners = this.cleanOwner(nh.ownerCH);
          return h.code !== nh.code && owners.some(o => otherOwners.includes(o));
        }))
        .forEach(h => matches.add(h));

    } else if (criteria.match(/^@@@$/g)) {
      this.horses
        .filter(h => !this.isSyndicateHorse(h))
        .filter(h => !this.isBelongToOtherSyndicate(h))
        .filter(h => !h.retired)
        .forEach(h => matches.add(h));

    } else if (criteria.match(/^###$/g)) {
      this.horses
        .filter(h => !this.isSyndicateHorse(h))
        .filter(h => !this.isBelongToOtherSyndicate(h))
        .filter(h => this.syndicates
          .some(s => s.members.some(m => h.ownerCH.includes(m)))
        )
        .forEach(h => matches.add(h));

    } else if (criteria.match(/^%%%$/g)) {
      this.horses
        .filter(h => !this.isSyndicateHorse(h))
        .filter(h => !this.isBelongToOtherSyndicate(h))
        .filter(h => this.horses.some(nh => {
          const owners = this.cleanOwner(h.ownerCH);
          const otherOwners = this.cleanOwner(nh.ownerCH);

          return h.code !== nh.code &&
            owners.some(o1 => otherOwners.some(o2 =>
              o1.length === 3
              && o2.length === 3
              && o1[0] === o2[0]
              && (o1[1] === o2[1] || o1[2] === o2[2])
            ));
        }))
        .forEach(h => matches.add(h));

    } else if (criteria.match(/^[A-Z]\d+/g)) {
      const brands = criteria
        .split(',')
        .map(e => e.trim())
        .filter(e => e.match(/^[A-Z]\d{3}$/g));

      this.horses
        .filter(h => brands.includes(h.code))
        .forEach(h => matches.add(h));

    } else {
      if (criteria.length === 1) {
        this.horses
          .filter(h =>
            h.nameCH.toUpperCase().includes(criteria) ||
            h.ownerCH.toUpperCase().includes(criteria)
          )
          .forEach(h => matches.add(h));
      }
      if (criteria.length > 1) {
        this.horses
          .filter(h =>
            h.nameCH.toUpperCase().includes(criteria) ||
            h.nameEN.toUpperCase().includes(criteria) ||
            h.ownerCH.toUpperCase().includes(criteria)
          )
          .forEach(h => matches.add(h));
      }
    }

    this.horses
      .filter(h => this.activeSyndicate.members.some(m => h.ownerCH.includes(m)))
      .forEach(h => matches.add(h));

    const syndicateHorses = this.horses
      .filter(h => this.activeSyndicate.horses.includes(h.code))
      .sort(this.horseSorter);

    const matchedHorses = Array
      .from(matches.keys())
      .filter(h => !syndicateHorses.includes(h))
      .sort(this.horseSorter);

    return syndicateHorses.concat(matchedHorses);
  }

  get statistics(): Array<{ label: string, count: number }> {
    const syndicateHorses = this.syndicates
      .map(s => s.horses.length)
      .reduce((h1, h2) => h1 + h2, 0);

    return [
      {label: 'Syndicates', count: this.syndicates.length},
      {label: 'Syndicate Horses', count: syndicateHorses},
      {label: 'Free Horses', count: this.horses.length - syndicateHorses},
      {label: 'Retired Horses', count: this.horses.filter(h => h.retired).length},
      {label: 'Total Horses', count: this.horses.length},
    ];
  }

  get horses(): Horse[] {
    return this.repo.findHorses();
  }

  get syndicates(): Syndicate[] {
    return this.repo.findSyndicates();
  }
}