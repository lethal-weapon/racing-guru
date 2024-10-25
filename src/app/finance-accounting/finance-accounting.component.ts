import {Component, OnInit} from '@angular/core';

import {RestRepository} from '../model/rest.repository';
import {ACCOUNT_GROUPS, ACCOUNT_ITEM, DEFAULT_JOURNAL, Entry, Journal} from '../model/journal.model';

const JOURNAL_PAGE_SIZE = 10;

@Component({
  selector: 'app-finance-accounting',
  templateUrl: './finance-accounting.component.html'
})
export class FinanceAccountingComponent implements OnInit {

  journalIndex: number = 0;
  journalMessage: string = '';
  editingJournal: Journal = {
    ...DEFAULT_JOURNAL,
    entries: [
      {
        accountGroup: ACCOUNT_GROUPS[0].group,
        account: ACCOUNT_GROUPS[0].accounts[0].name,
        debit: 0,
        credit: 0,
      },
      {
        accountGroup: ACCOUNT_GROUPS[1].group,
        account: ACCOUNT_GROUPS[1].accounts[0].name,
        debit: 0,
        credit: 0,
      },
    ]
  };

  protected readonly ACCOUNT_GROUPS = ACCOUNT_GROUPS;

  constructor(private repo: RestRepository) {
  }

  ngOnInit(): void {
    this.repo.fetchJournals();
  }

  getEntryAmount = (journal: Journal, account: ACCOUNT_ITEM):
    { debit: boolean, amount: number } => {

    const entry = journal.entries.find(e => e.account === account.name);
    if (entry) {
      return {
        debit: entry.debit > 0,
        amount: entry.debit > 0 ? entry.debit : entry.credit,
      }
    }
    return {debit: false, amount: 0};
  }

  addEntry = () =>
    this.editingJournal.entries.push({
      accountGroup: ACCOUNT_GROUPS[0].group,
      account: ACCOUNT_GROUPS[0].accounts[0].name,
      debit: 0,
      credit: 0,
    })

  deleteEntry = (clicked: Entry) => {
    if (this.editingJournal.entries.length >= 3) {
      this.editingJournal.entries =
        this.editingJournal.entries.filter(e => e !== clicked);
    }
  }

  copyJournal = (clicked: Journal) => {
    this.editingJournal = {
      ...clicked,
      id: '',
      entries: [...clicked.entries]
    };
  }

  saveJournal = () => {
    if (this.editingJournal.description.trim().length < 1) {
      this.journalMessage = 'Please enter a description.';
      return;
    }
    if (this.editingJournal.entries.length < 2) {
      this.journalMessage = 'Any journal should have at least 2 entries.';
      return;
    }
    for (const entry of this.editingJournal.entries) {
      if (
        (entry.debit < 0 || entry.credit < 0)
        ||
        (entry.debit < 1 && entry.credit < 1)
        ||
        (entry.debit > 0 && entry.credit > 0)
      ) {
        this.journalMessage = 'You have invalid entry.';
        return;
      }
    }
    const totalDebit = this.editingJournal.entries
      .map(e => e.debit)
      .reduce((prev, curr) => prev + curr, 0);
    const totalCredit = this.editingJournal.entries
      .map(e => e.credit)
      .reduce((prev, curr) => prev + curr, 0);

    if (totalDebit !== totalCredit) {
      this.journalMessage = `Total Debit $${totalDebit} is not equal to Total Credit $${totalCredit}.`;
      return;
    }

    this.editingJournal.description = this.editingJournal.description.trim();
    this.repo.saveJournal(
      this.editingJournal,
      (saved: Journal) => {
        this.copyJournal(saved);
        this.journalMessage = 'Journal was saved successfully!';
      }
    );
  }

  getAccountNames = (group: string): string[] =>
    (ACCOUNT_GROUPS.find(ag => ag.group === group)?.accounts || []).map(a => a.name)

  get journalLabel(): string {
    return this.editingJournal.id === ''
      ? `* New Journal *`
      : `Journal #${this.editingJournal.id.slice(0, 7)}`;
  }

  get windowJournals(): Journal[] {
    return this.journals
      .slice(this.journalIndex, this.journalIndex + JOURNAL_PAGE_SIZE);
  }

  get journals(): Journal[] {
    return this.repo.findJournals();
  }

  get isLoading(): boolean {
    return this.repo.findJournals().length === 0;
  }
}
