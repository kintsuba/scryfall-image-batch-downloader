# Scryfall Image Batch Downloader

Scryfall Image Batch Downloader(SIBD) provides an easy and straightforward way to download images from Scryfall in batches for any card.

## Usage

In the form on [this site](https://scryfall-image-batch-downloader.vercel.app/), enter the list of cards you wish to download and click on the "Search" button.

The card list must be in the following format:

```
1 Kenrith, the Returned King
1 Archivist of Oghma
1 Avacyn's Pilgrim
1 Biomancer's Familiar
```

For example, for a MoxFiled decklist, you can get the list in this format from [More] → [Export] → [Copy for MTGO].

## Contributing

### Develop

```shell
pnpm
pnpm dev
```

### Production

```shell
pnpm
pnpm build
node .output/server/index.mjs
```

If you choose to deploy to [Vercel](https://vercel.com/), you do not need to configure anything at all, including the above.

### Licence

MIT
