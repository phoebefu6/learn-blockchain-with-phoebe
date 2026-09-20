# Learn Blockchain with Phoebe

**How a blockchain actually works, without the hype.** Sixteen 45-minute sessions on the
mechanism, what it guarantees, what it costs to defeat, and when a database is the better answer.

Live: https://phoebefu6.github.io/learn-blockchain-with-phoebe/

Harbourgate is a port authority keeping a custody register: who signed for which consignment, who
inspected it, whether the seal was intact. Change one entry and a check fires. Recompute the hash
to cover your tracks and the failure does not disappear, it moves one block along. Hide it
completely and you have to redo every block that follows. That is the whole idea.

It is also not magic. A chain preserves what was written and has no opinion on whether it was
true.

## Two tracks

**Leader, six sessions, no code.** What a chain actually is; tamper evident is not tamper proof;
what it costs to rewrite history; who agrees and how; what a chain cannot do for you; and
deciding whether you need one.

**Practitioner, ten sessions, hands on.** Hashing; building the chain; breaking it; mining; the
cost of a rewrite; Merkle trees; signatures and identity; consensus; smart contracts as a
mechanism; and a capstone bench.

## The hash is real, and it is checked

`assets/chain-live.js` contains a full SHA-256 written from the specification, not a stand-in. It
ships the three published test vectors and runs them, because **a hash that is subtly wrong still
produces plausible looking hex and every downstream guarantee silently evaporates**. It was also
cross-checked against node's own `crypto` module on four further inputs.

- **Avalanche, measured properly.** Across 20,000 pairs of unrelated inputs the mean number of
  differing hex characters is **59.99 of 64**. So the honest statement is not "most of the digest
  changes", it is that changing one character produces a digest **statistically indistinguishable
  from an unrelated input**.
- **Mining cost, as a mean with its trial count.** 16, 277, 4,115 and 74,190 attempts at
  difficulties 1 to 4, over 500, 300, 120 and 150 trials. The spread is the real finding: at
  difficulty 3 the measured range runs from 40 to 17,343 attempts. Mining is a lottery, and no
  page here quotes a single run as "the cost".
- **Merkle proofs.** Proof length is exactly log2 of the set size. At 1,024 records the proof is
  10 hashes, and every proof in the table was verified against its root.

## The capstone

`p10` puts the register in the page with the buttons an attacker would want. Build, edit block 2,
recompute its hash, reforge. The check reports clean, then a hash mismatch at block 2, then a
link mismatch at block 3, then clean again. At difficulty 0 that last step costs nothing
measurable, which is precisely why mining exists.

## Running it

No build step. Any static server:

```
python3 -m http.server 8691
```

Then open http://localhost:8691/

## Scope

This course is about the mechanism. **There is no cryptocurrency, price, market, wallet or token
anywhere in it, and nothing here is investment advice.** Coins and money are a different subject,
tokens and the wider stack are another, and key management belongs with the security courses.

## Credits

by Phoebe Fu. Part of [Learn with Phoebe](https://phoebefu6.github.io/learn-with-phoebe/).

Key management lives in
[learn cyber security](https://phoebefu6.github.io/learn-cyber-security-with-phoebe/) and
[learn data access control](https://phoebefu6.github.io/learn-data-access-control-with-phoebe/).
