import {Component, OnInit} from '@angular/core';

import {RestRepository} from '../model/rest.repository';
import {ACCOUNT_GROUPS, ACCOUNT_ITEM, createNewJournal, Entry, Journal} from '../model/journal.model';

const JOURNAL_PAGE_SIZE = 5;

@Component({
  selector: 'app-finance-accounting',
  templateUrl: './finance-accounting.component.html'
})
export class FinanceAccountingComponent implements OnInit {

  criteria: string = '';
  journalIndex: number = 0;
  journalMessage: string = '';
  editingJournal: Journal = createNewJournal();

  hoveringJournalId: string = '';
  viewingJournalPeriod: string = 'ALL';

  protected readonly math = Math;
  protected readonly ACCOUNT_GROUPS = ACCOUNT_GROUPS;

  constructor(private repo: RestRepository) {
  }

  ngOnInit(): void {
    this.repo.fetchJournals();
  }

  getAccountTotal = (account: ACCOUNT_ITEM): number =>
    this.journals
      .flatMap(j => j.entries)
      .filter(e => e.account === account.name)
      .map(e => e.debit > 0 ? e.debit : -e.credit)
      .reduce((prev, curr) => prev + curr, 0)

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

  addEntry = () => {
    const existingEntryAccountGroups = this.editingJournal.entries.map(e => e.accountGroup);
    const existingEntryAccounts = this.editingJournal.entries.map(e => e.account);

    let newAccountGroup = ACCOUNT_GROUPS
      .find(ag => !existingEntryAccountGroups.includes(ag.group));

    if (!newAccountGroup) newAccountGroup = ACCOUNT_GROUPS[0];

    let newAccount = newAccountGroup
      .accounts.find(a => !existingEntryAccounts.includes(a.name));

    if (!newAccount) newAccount = newAccountGroup.accounts[0];

    this.editingJournal.entries.push({
      accountGroup: newAccountGroup.group,
      account: newAccount.name,
      debit: 0,
      credit: 0,
    })
  }

  deleteEntry = (clicked: Entry) => {
    if (this.editingJournal.entries.length >= 3) {
      this.editingJournal.entries =
        this.editingJournal.entries.filter(e => e !== clicked);
    }
  }

  saveJournal = () => {
    if (!this.isValidJournal()) return;

    this.editingJournal.description = this.editingJournal.description.trim();
    this.repo.saveJournal(
      this.editingJournal,
      (saved: Journal) => {
        this.editingJournal = createNewJournal();
        this.journalMessage = `Journal #${saved.id.slice(0, 7)} was saved successfully!`;
      }
    );
  }

  editJournal = (clicked: Journal) => {
    this.editingJournal = {...clicked, entries: []};
    clicked.entries.forEach(e => this.editingJournal.entries.push({...e}));
  }

  deleteJournal = () => {
    const journalId = this.editingJournal.id;
    if (journalId === '') return;

    this.repo.deleteJournal(
      this.editingJournal,
      () => {
        this.editingJournal = createNewJournal();
        this.journalMessage = `Journal #${journalId.slice(0, 7)} was deleted successfully!`;
      }
    );
  }

  isValidJournal = (): boolean => {
    if (this.editingJournal.description.trim().length < 1) {
      this.journalMessage = 'Please enter a description.';
      return false;
    }
    if (this.editingJournal.entries.length < 2) {
      this.journalMessage = 'Any journal should have at least 2 entries.';
      return false;
    }
    for (const entry of this.editingJournal.entries) {
      if (!entry.accountGroup || !entry.account) {
        this.journalMessage = 'Journal has invalid account.';
        return false;
      }
      if (
        (entry.debit < 0 || entry.credit < 0)
        ||
        (entry.debit < 1 && entry.credit < 1)
        ||
        (entry.debit > 0 && entry.credit > 0)
      ) {
        this.journalMessage = 'Journal has unmatched debit/credit.';
        return false;
      }
    }
    for (let i = 0; i < this.editingJournal.entries.length - 1; i++) {
      const entryA = this.editingJournal.entries[i];

      for (let j = i + 1; j < this.editingJournal.entries.length; j++) {
        const entryB = this.editingJournal.entries[j];

        if (entryA.accountGroup === entryB.accountGroup && entryA.account === entryB.account) {
          this.journalMessage = 'Journal has duplicated accounts.';
          return false;
        }
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
      return false;
    }

    return true;
  }

  updateEntryAccount = (entry: Entry) =>
    entry.account = this.getAccountNames(entry.accountGroup)[0] || ''

  getAccountNames = (group: string): string[] =>
    (ACCOUNT_GROUPS.find(ag => ag.group === group)?.accounts || []).map(a => a.name)

  shiftJournalPage = (length: number) => {
    const ws = JOURNAL_PAGE_SIZE;
    const maxIndex = this.journals.length - ws;

    switch (length) {
      case -999:
        this.journalIndex = 0;
        break;
      case 999:
        this.journalIndex = maxIndex;
        break;
      case -ws:
        if (this.journalIndex >= ws) this.journalIndex -= ws;
        else this.journalIndex = 0;
        break;
      case ws:
        if (this.journalIndex < maxIndex - ws) this.journalIndex += ws;
        else this.journalIndex = maxIndex;
        break;
    }
  }

  get viewingJournalPeriodOptions(): string[] {
    const options = this.repo.findJournals()
      .map(j => {
        const year = j.date.slice(0, 4);
        const month = new Date(j.date).toLocaleString('en-US', {month: 'short'}).toUpperCase();
        return `${month} ${year}`;
      })
      .filter((m, index, arr) => index === arr.indexOf(m));

    return ['ALL', ...options];
  }

  get journalLabel(): string {
    return this.editingJournal.id === ''
      ? `* New Journal *`
      : `Journal #${this.editingJournal.id.slice(0, 7)}`;
  }

  get paginationControls(): Array<{ control: string, length: number }> {
    return [
      {control: 'First', length: -999},
      {control: 'Prev', length: -JOURNAL_PAGE_SIZE},
      {control: 'Next', length: JOURNAL_PAGE_SIZE},
      {control: 'Last', length: 999},
    ];
  }

  get windowJournals(): Journal[] {
    return this.journals
      .slice(this.journalIndex, this.journalIndex + JOURNAL_PAGE_SIZE);
  }

  get journals(): Journal[] {
    const criteria = this.criteria.trim().toUpperCase();
    return this.repo.findJournals()
      .filter(j => {
        if (criteria.length < 1) return j;
        return j.description.toUpperCase().includes(criteria)
          || j.entries.some(e => e.debit.toString().includes(criteria))
          || j.entries.some(e => e.credit.toString().includes(criteria));
      })
      .sort((j1, j2) => j2.date.localeCompare(j1.date));
  }

  get isLoading(): boolean {
    return this.repo.findJournals().length === 0;
  }
}
