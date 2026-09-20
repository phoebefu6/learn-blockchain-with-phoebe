# Official course map - learn-blockchain-with-phoebe

Bucket `emrg`, difficulty d2, 16 sessions, Leader 6 + Practitioner 10.
Setting: **Harbourgate**, a fictional port authority keeping a custody register for consignments
moving through a cold store. Chosen deliberately: it is a chain used for provenance, not money,
so the mechanics can be taught before anybody argues about currency.

---

## The seam - read this before writing a single page

`emrg` was the last empty shelf. This is its first course.

| Subject | Owner | This course |
|---|---|---|
| Key management, certificates, cryptographic hygiene | `learn-cyber-security-with-phoebe`, `learn-data-access-control-with-phoebe` | Not taught. `public key` is the only blockchain term with any estate presence (2 pages, both there). Named in a clause where signatures come up. |
| Bitcoin, wallets, digital money as a subject | `learn-crypto-with-phoebe` (emrg d2, PLANNED) | Not taught. **No price, no market, no wallet walkthrough.** |
| Tokens, dapps, the web3 stack and its claims | `learn-web3-with-phoebe` (emrg d3, PLANNED) | Not taught. Smart contracts are explained as a mechanism in one session and handed on. |
| Trading, signals, backtesting | `learn-quant-trading-with-phoebe` (emrg d4, PLANNED) | Not taught, and nothing here is investment advice. |
| Distributed systems consensus in general | Nobody yet | Taught only as far as the blockchain argument needs. |

**Estate vocabulary check before this build.** `Merkle` **0**, `proof of work` **0**,
`smart contract` **0**, `consensus mechanism` **0**, `hash chain` **0**, `SHA-256` **0**,
`distributed ledger` **0**, `byzantine` **0**, `nonce` **0**, `immutable ledger` **0**,
`51 percent attack` **0**, `digital signature` **0**. Twelve of thirteen terms return nothing
estate-wide. The exception is `public key`, 2 pages, both in the security courses.

---

## Frozen canon - the Harbourgate register

Computed in node from `assets/chain-live.js` before any page quoted a number.
**Any page citing these must match exactly.**

### The hash is real and it is checked

`chain-live.js` contains a full SHA-256 written from the specification. It carries the three
published test vectors and `selfTest()` runs them:

| Input | Expected digest |
|---|---|
| `abc` | `ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad` |
| empty string | `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855` |
| `abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq` | `248d6a61d20638b8e5c026930c3e6039a33ce45964ff2167f6ecedd419db06c1` |

All three pass, and the implementation was additionally cross-checked against node's own
`crypto` module on four further inputs including a 1,000 character string. **A hash that is
wrong would make every other figure in this course meaningless, so it is verified rather than
assumed.**

### The six block register

Six entries, fixed timestamps from 1758000000 at 600 second intervals, difficulty 0.

| Block | Entry | Hash begins |
|---|---|---|
| 0 | Harbourgate opens the register | `608eba0870199b95` |
| 1 | Consignment 41 signed over to Pell and Sons | `86202a0bab83df26` |
| 2 | Consignment 41 inspected, seal intact | `f325e5d96bee6a1d` |
| 3 | Consignment 42 signed over to Ardwick Cold Store | `fc189d9dba7c4311` |
| 4 | Consignment 41 released to the buyer | `e5526e6e0bbc1aed` |
| 5 | Consignment 42 inspected, seal broken | `1e9fa1742f98715d` |

`verify()` returns ok on the untampered chain.

### Avalanche, measured

Changing one character changes most of the digest. Both pairs below were computed from
`chain-live.js`.

| Input | Digest |
|---|---|
| `abc` | `ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad` |
| `abd` | `a52d159f262b2c6ddb724a61840befc36eb30c88877a4030b65cbe86298449c9` |

**58 of the 64 hex characters differ.** A one letter edit inside a Harbourgate entry does the
same thing:

| Input | Digest |
|---|---|
| `Consignment 41 inspected, seal intact` | `f0c5a3b1469adfcafafc37934b52a3c180d65419382858fb242ea484a10f4a4a` |
| `Consignment 41 inspected, seal Intact` | `9ab0c83cecdb404d8089e91684d00c3704835e035897cd6b155ba763fb3989f8` |

**60 of 64 differ**, from a single capital letter. Two digests that differ in about three
quarters of their characters is what "no gradient between neighbouring inputs" means in practice.
Note that these two are not the same as the block hashes in the register table: a block hash is
taken over the whole assembled block, not over the entry text alone.

**What 58 of 64 actually means, measured.** Across **20,000 pairs of unrelated inputs** the mean
number of differing hex characters is **59.99 of 64**, against a theoretical 60.00 (each position
agrees by chance about one time in sixteen, so about four coincidental matches are expected). The
observed range was 50 to 64.

So the right way to state the avalanche property is **not** "most of the digest changes", which
sounds impressive and is nearly content free. It is this: **changing one character produces a
digest statistically indistinguishable from the digest of a completely unrelated input.** The
measured pairs above, at 58 and 60, sit squarely inside the range you get from inputs that have
nothing to do with each other. That is the whole point, and pages should teach it that way.

### The genesis block

The first block has no predecessor, so its previous-hash field is **64 zero characters**:
`0000000000000000000000000000000000000000000000000000000000000000`. That is a convention, not a
computed value, and it is what makes block 0 identifiable as the start of the register.

### Tamper detection, and the attacker who tries harder

This is the spine of the course and it has **two stages**, which most explanations collapse into
one.

**Stage one, edit the data only.** Change block 2 to "Consignment 41 inspected, seal BROKEN" and
leave every stored hash alone. `verify()` returns **one problem: a hash mismatch at block 2**. The
recomputed hash no longer matches the stored one.

**Stage two, the attacker also recomputes that block's hash.** Now block 2 is internally
consistent again, and `verify()` returns **one problem: a link mismatch at block 3**, because
block 3 still records the old hash as its predecessor. **Fixing the hash does not hide the edit,
it moves the failure one block along.**

**Stage three is the point.** To make the register internally consistent, the attacker must redo
block 2 and every block after it: **4 blocks, 2 through 5**. With no mining that is instant, and
that is precisely why mining exists.

### Proof of work: the cost of redoing it

Mining means finding a nonce whose block hash starts with `difficulty` zeros. Expected attempts
are 16 to the power of the difficulty. **A single run tells you almost nothing**, so each row
below is a mean over many independent blocks.

| Difficulty | Trials | Mean attempts | Expected 16^d | Min | Max |
|---|---|---|---|---|---|
| 1 | 500 | 16 | 16 | 1 | 101 |
| 2 | 300 | 277 | 256 | 1 | 2,147 |
| 3 | 120 | 4,115 | 4,096 | 40 | 17,343 |
| 4 | 150 | 74,190 | 65,536 | 149 | 339,789 |

**The mean tracks 16^d and the spread is enormous.** At difficulty 3 the measured range runs from
40 attempts to 17,343, a factor of more than 400 around a mean of 4,115. At difficulty 4 it runs
from 149 to 339,789. Mining is a lottery in which the expected number of tickets is known and any
single draw is close to uninformative.

**A claim NOT to make.** Do not present a single mining run as "the cost". The first run of this
bench produced 3 attempts at difficulty 1 and 12,462 at difficulty 3, against expectations of 16
and 4,096. Quoting either would have been wrong in opposite directions. Every cost claim on any
page must be a mean with its trial count beside it.

### Merkle proofs

Proving one record belongs to a set without sending the set.

| Records | Proof steps | Hashes if you sent everything |
|---|---|---|
| 4 | 2 | 4 |
| 8 | 3 | 8 |
| 16 | 4 | 16 |
| 64 | 6 | 64 |
| 256 | 8 | 256 |
| 1,024 | 10 | 1,024 |

Proof length is exactly log2 of the set size. **At 1,024 records the proof is 10 hashes.** Every
proof above was verified against its root with `verifyProof`, and a proof that does not verify
is reported rather than ignored.

---

## Coverage per session

`✓` = taught to working depth. `◐` = named and handed on.

### Leader track

| Session | Covers | Depth |
|---|---|---|
| a1 What a chain actually is | A hash, a link, and why that makes edits visible; the Harbourgate register | ✓ |
| a2 Tamper evident is not tamper proof | The two stage attack; what the chain does and does not prevent | ✓ |
| a3 What it costs to rewrite history | Proof of work as deliberate expense; the mean and the spread | ✓ |
| a4 Who agrees, and how | Consensus in plain terms; why "decentralised" is a spectrum, not a switch | ✓ |
| a5 What a chain cannot do for you | Garbage in stays garbage; the oracle problem; when a database is the right answer | ✓ |
| a6 Deciding whether you need one | A short decision path, and the honest answer that usually you do not | ✓ |
| Bitcoin, wallets, money | Handed to `learn-crypto` | ◐ |
| Tokens and the web3 stack | Handed to `learn-web3` | ◐ |

### Practitioner track

| Session | Covers | Depth |
|---|---|---|
| p1 Hashing, hands on | SHA-256 as a function; the avalanche effect; the test vectors | ✓ |
| p2 Building the chain | Blocks, previous hashes, the genesis block | ✓ |
| p3 Breaking the chain | Both stages of the tamper, and reading `verify()` output | ✓ |
| p4 Mining | Nonces, difficulty, and measuring attempts properly | ✓ |
| p5 The cost of a rewrite | Reforging from block 2, and what difficulty buys | ✓ |
| p6 Merkle trees | Building one, proving membership, log2 proof length | ✓ |
| p7 Signatures and identity | Who may add an entry; public keys named, key management handed on | ✓ |
| p8 Consensus | Forks, longest chain, finality as a probability rather than a fact | ✓ |
| p9 Smart contracts, mechanically | Code that runs on the chain, and what that does not guarantee | ✓ |
| p10 The chain bench | Build, tamper, mine, reforge and prove, all live | ✓ |
| Key management and certificate hygiene | Pointed at `learn-cyber-security` | ◐ |

## Not covered, by design

- **Any cryptocurrency, price, market or wallet.** `learn-crypto`.
- **Tokens, dapps, the web3 stack.** `learn-web3`.
- **Trading of any kind. Nothing on any page is investment advice.**
- **Key management in practice.** `learn-cyber-security`, `learn-data-access-control`.
- **Named commercial chains and their roadmaps.** They move faster than a course can.

## Re-verify before delivery

The hash is deterministic and the chain is reproducible from fixed timestamps. If
`chain-live.js` is edited, re-run `selfTest()` first and then the canon harness, and update every
number here before touching a page. **Every mining cost must be a mean with its trial count, run
across at least four difficulties** - a single run gave 3 attempts where the mean is 16.
