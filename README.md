# 💿 Tónlistar-letterboxd
Fullkomni staðurinn til að halda utan um tónlistina þína! Notendur geta flétt upp plötum með leitarvél, addað þeim í library, gefið stjörnugjöf, og skrifað review. Flott overview viðmót, þar sem að þú getur skoðað plöturnar þínar, og raðað eftir t.d. stjörnugjöf, artista, tónlistartegund o.fl.
## Tech-stack
- Framework: Hono
- Tengin við api MusicBrainz.org fyrir gögn um tónlistina
- Gagnagrunnur: PostgreSQL, Prisma, REST API
## Kjarnvirkni
- Heimasíða: notandi sér heimasíðu með nýlega viðbættum plötum
- Leit: notandi getur skrifað nafn á plötu í leitarvél, og fengið results á meðan hann skrifar.
- Library management: notandi getur bætt við plötum í safnið sitt, gefið plötu einkunn, skrifað eitthvað um hana, og vistað síðan í gagnagrunni. Notandi getur bætt plötum í "To-Listen" lista.
- Library overview: notandi getur flokkað plötum eftir einhverju property (stjörnugjöf, útgáfuár, artisti, o.fl.). Notandi getur skoðað allskonar tölfræði um tónlistina í safninu sínu (t.d. meðal-stjörnugjöf á mismunandi tónlistartegundum)
## Möguleg viðbótarvirkni ef tími leyfir
- Flóknara og flottara css (óákveðið)
## Eitthvað til að skoða
- Importa Spotify album library inn á vefsíðu sjálfkrafa?


| Vika    | Verkefni                                                                                                                                               |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 6.-9.   | - Ákveða verkefni og skipulagning                                                                                                                      |
| 10.     | - Setja upp Hono + PostgreSQL<br>- Útfæra tengingu við MusicBrainz API<br>- Vista plötur í gagnagrunni (CRUD)                                          |
| 11.     | - Library overview (sækja og birta plötur) <br>- Virkni á library (bæta við einkunn, filtera og raða plötum)<br>- Skrifa tests á API<br>- Plana viðmót |
| 12.     | - Byrja á viðmóti (tailwind)<br>- Halda áfram með viðmót (animations, cool effects)<br>- Setja upp í hýsingu (render?)                                 |
| 13.     | - Bæta viðmót<br>- Laga bugs, endurskoða fyrri verkefni                                                                                                |
| 14.<br> | - Fínpússa það sem þarf<br>- Skrifa skýrslu                                                                                                            |

## Matskvarði
#### Kjarnvirkni (30%)
- Leita að plötum með MusicBrainz API
- Vista plötur, gefa review, flokka plötur
#### Gagnagrunnur (20%)
- Prisma schema og virkni með Hono
- REST API
#### Viðmót (30%)
- Fancy viðmót með tailwind
#### Hýsing
- Render?
