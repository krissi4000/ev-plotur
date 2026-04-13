import { describe, it, expect, vi, beforeEach } from "vitest";
import { searchReleaseGroups } from "./musicbrainz.js";

describe("searchReleaseGroups", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  it("maps API response to MBReleaseGroup", async () => {
    const mockData = {
      "release-groups": [
        {
          id: "abc123",
          title: "OK Computer",
          "first-release-date": "1997-05-21",
          "artist-credit": [{ artist: { id: "artist1", name: "Radiohead" } }],
          tags: [
            { name: "rock", count: 10 },
            { name: "alternative", count: 5 },
          ],
        },
      ],
    };

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => mockData,
    } as Response);

    const results = await searchReleaseGroups("OK Computer");

    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({
      id: "abc123",
      title: "OK Computer",
      artist: "Radiohead",
      releaseYear: 1997,
      genre: "rock",
    });
  });

  it("throws when API returns an error status", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 500,
    } as Response);

    await expect(searchReleaseGroups("test")).rejects.toThrow(
      "MusicBrainz API error: 500"
    );
  });

  it("falls back to Unknown Artist when artist-credit is empty", async () => {
    const mockData = {
      "release-groups": [
        {
          id: "xyz",
          title: "Mystery Album",
          "artist-credit": [],
        },
      ],
    };

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => mockData,
    } as Response);

    const results = await searchReleaseGroups("mystery");
    expect(results[0].artist).toBe("Unknown Artist");
  });

  it("returns null genre when no tags present", async () => {
    const mockData = {
      "release-groups": [
        {
          id: "xyz",
          title: "No Tags Album",
          "artist-credit": [{ artist: { id: "a1", name: "Artist" } }],
        },
      ],
    };

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => mockData,
    } as Response);

    const results = await searchReleaseGroups("test");
    expect(results[0].genre).toBeNull();
  });
});
