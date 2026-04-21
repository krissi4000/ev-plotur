import { describe, it, expect, vi, beforeEach } from "vitest";
import { searchAlbums } from "./lastfm.js";

describe("searchAlbums", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
    vi.stubEnv("LASTFM_API_KEY", "test-key");
  });

  it("maps Last.fm search + getInfo responses to LastfmAlbum[]", async () => {
    const searchResponse = {
      results: {
        albummatches: {
          album: [
            {
              name: "OK Computer",
              artist: "Radiohead",
              image: [
                { "#text": "https://img.fm/small.jpg", size: "small" },
                { "#text": "https://img.fm/large.jpg", size: "extralarge" },
              ],
            },
          ],
        },
      },
    };

    const getInfoResponse = {
      album: {
        name: "OK Computer",
        artist: "Radiohead",
        wiki: { published: "11 Nov 2022, 15:31", content: "OK Computer is the third album by the English rock band Radiohead, released in 1997." },
        tags: {
          tag: [
            { name: "alternative rock", url: "https://www.last.fm/tag/alternative+rock" },
            { name: "rock", url: "https://www.last.fm/tag/rock" },
            { name: "experimental", url: "https://www.last.fm/tag/experimental" },
            { name: "electronic", url: "https://www.last.fm/tag/electronic" },
            { name: "british", url: "https://www.last.fm/tag/british" },
          ],
        },
        image: [
          { "#text": "https://img.fm/small.jpg", size: "small" },
          { "#text": "https://img.fm/large.jpg", size: "extralarge" },
        ],
      },
    };

    vi.mocked(fetch)
      .mockResolvedValueOnce({ ok: true, json: async () => searchResponse } as Response)
      .mockResolvedValueOnce({ ok: true, json: async () => getInfoResponse } as Response);

    const results = await searchAlbums("OK Computer", 1);

    expect(results).toHaveLength(1);
    expect(results[0]).toEqual({
      lastfmKey: "radiohead:ok computer",
      title: "OK Computer",
      artist: "Radiohead",
      releaseYear: 1997,
      genres: ["alternative rock", "rock", "experimental", "electronic"],
      coverArtUrl: "https://img.fm/large.jpg",
    });
  });

  it("takes first 4 tags when more are available", async () => {
    const searchResponse = {
      results: {
        albummatches: {
          album: [{ name: "A", artist: "B", image: [] }],
        },
      },
    };

    const getInfoResponse = {
      album: {
        name: "A",
        artist: "B",
        tags: {
          tag: [
            { name: "t1", url: "" },
            { name: "t2", url: "" },
            { name: "t3", url: "" },
            { name: "t4", url: "" },
            { name: "t5", url: "" },
          ],
        },
        image: [],
      },
    };

    vi.mocked(fetch)
      .mockResolvedValueOnce({ ok: true, json: async () => searchResponse } as Response)
      .mockResolvedValueOnce({ ok: true, json: async () => getInfoResponse } as Response);

    const results = await searchAlbums("A", 1);
    expect(results[0].genres).toEqual(["t1", "t2", "t3", "t4"]);
  });

  it("returns empty genres when no tags present", async () => {
    const searchResponse = {
      results: {
        albummatches: {
          album: [
            { name: "Album", artist: "Artist", image: [] },
          ],
        },
      },
    };

    const getInfoResponse = {
      album: {
        name: "Album",
        artist: "Artist",
        tags: { tag: [] },
        image: [],
      },
    };

    vi.mocked(fetch)
      .mockResolvedValueOnce({ ok: true, json: async () => searchResponse } as Response)
      .mockResolvedValueOnce({ ok: true, json: async () => getInfoResponse } as Response);

    const results = await searchAlbums("Album", 1);
    expect(results[0].genres).toEqual([]);
  });

  it("throws when search API returns an error status", async () => {
    vi.mocked(fetch).mockResolvedValue({ ok: false, status: 500 } as Response);
    await expect(searchAlbums("test")).rejects.toThrow("Last.fm API error: 500");
  });
});
