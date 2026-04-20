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
        wiki: { published: "21 May 1997" },
        tags: {
          tag: [
            { name: "alternative rock", count: 100 },
            { name: "rock", count: 87 },
            { name: "experimental", count: 64 },
            { name: "electronic", count: 52 },
            { name: "british", count: 30 },
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

  it("filters out tags with count below 50", async () => {
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
        tags: {
          tag: [
            { name: "rock", count: 100 },
            { name: "noise", count: 40 },
            { name: "ambient", count: 20 },
          ],
        },
        image: [],
      },
    };

    vi.mocked(fetch)
      .mockResolvedValueOnce({ ok: true, json: async () => searchResponse } as Response)
      .mockResolvedValueOnce({ ok: true, json: async () => getInfoResponse } as Response);

    const results = await searchAlbums("Album", 1);
    expect(results[0].genres).toEqual(["rock"]);
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

  it("limits to max 4 genres even if more have count >= 50", async () => {
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
            { name: "t1", count: 100 },
            { name: "t2", count: 90 },
            { name: "t3", count: 80 },
            { name: "t4", count: 70 },
            { name: "t5", count: 60 },
          ],
        },
        image: [],
      },
    };

    vi.mocked(fetch)
      .mockResolvedValueOnce({ ok: true, json: async () => searchResponse } as Response)
      .mockResolvedValueOnce({ ok: true, json: async () => getInfoResponse } as Response);

    const results = await searchAlbums("A", 1);
    expect(results[0].genres).toHaveLength(4);
  });
});
