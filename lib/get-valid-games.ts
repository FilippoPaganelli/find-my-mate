export type ValidPosition = {
  id: string;
  fen: string;
  createdAt: string;
};

// https://lichess.org/api#tag/Games/operation/apiGamesUser
export async function getValidPositions(beforeTimeStamp?: string) {
  console.log(
    `INFO: getting valid positions before time: ${beforeTimeStamp}...`
  );

  // Request preparation
  const base = "https://lichess.org/api/games/user/EricRosen";
  const url = new URL(base);
  url.searchParams.append("max", "10");
  url.searchParams.append("finished", "true");
  url.searchParams.append("lastFen", "true");
  if (beforeTimeStamp) {
    url.searchParams.append("until", beforeTimeStamp);
  }
  const headers = new Headers();
  headers.append("Accept", "application/x-ndjson");

  // Parse response until we have 10 valid games
  const validPositions: ValidPosition[] = [];
  let nextBefore = beforeTimeStamp;
  let maxRefetches = 1;

  while (validPositions.length < 10 && maxRefetches > 0) {
    console.log(`INFO: getting some more before: ${nextBefore}...`);
    if (nextBefore) {
      url.searchParams.delete("until");
      url.searchParams.append("until", nextBefore);
    }

    const response = await fetch(url, { headers });
    const text = await response.text();
    const rowsChunk = text
      .split(/\r?\n/)
      .filter(Boolean)
      .map((row) => JSON.parse(row));

    validPositions.push(
      ...rowsChunk
        .filter((game) => game.status === "mate")
        .map((game) => ({
          id: game.id,
          fen: game.lastFen,
          createdAt: game.createdAt,
        }))
    );
    if (rowsChunk.length < 10) break;

    const lastGame = rowsChunk[rowsChunk.length - 1];
    nextBefore = lastGame.createdAt ?? undefined;
    maxRefetches -= 1;
  }
  console.log(`INFO: found ${validPositions.length} valid positions.`);

  return validPositions;
}
