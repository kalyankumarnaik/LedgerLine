-- ============================================================================
-- LedgerLine Migration V2: Immutable Ledger Triggers & Conservation Constraints
-- ============================================================================

-- Function to forbid any UPDATE or DELETE operations on ledger_entries
CREATE OR REPLACE FUNCTION prevent_ledger_modification()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Ledger entries are strictly immutable. Updates and deletions are forbidden by financial integrity policy. Reversals must be executed via compensating transactions.';
END;
$$ LANGUAGE plpgsql;

-- Trigger to forbid UPDATE on ledger_entries
DROP TRIGGER IF EXISTS trg_prevent_ledger_update ON ledger_entries;
CREATE TRIGGER trg_prevent_ledger_update
BEFORE UPDATE ON ledger_entries
FOR EACH ROW
EXECUTE FUNCTION prevent_ledger_modification();

-- Trigger to forbid DELETE on ledger_entries
DROP TRIGGER IF EXISTS trg_prevent_ledger_delete ON ledger_entries;
CREATE TRIGGER trg_prevent_ledger_delete
BEFORE DELETE ON ledger_entries
FOR EACH ROW
EXECUTE FUNCTION prevent_ledger_modification();

-- Function to forbid any UPDATE or DELETE operations on journal_entries
CREATE OR REPLACE FUNCTION prevent_journal_modification()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Journal entries are strictly immutable. Posted transactions cannot be edited or removed.';
END;
$$ LANGUAGE plpgsql;

-- Trigger to forbid UPDATE on journal_entries
DROP TRIGGER IF EXISTS trg_prevent_journal_update ON journal_entries;
CREATE TRIGGER trg_prevent_journal_update
BEFORE UPDATE ON journal_entries
FOR EACH ROW
EXECUTE FUNCTION prevent_journal_modification();

-- Trigger to forbid DELETE on journal_entries
DROP TRIGGER IF EXISTS trg_prevent_journal_delete ON journal_entries;
CREATE TRIGGER trg_prevent_journal_delete
BEFORE DELETE ON journal_entries
FOR EACH ROW
EXECUTE FUNCTION prevent_journal_modification();
