# Skýrsla verkefnis
- **Kristján Jón Bogason**
- kjb10@hi.is
- Github repo: https://github.com/krissi4000/ev-plotur
- Railway hýsing: https://ev-plotur-production.up.railway.app/
---
## Inngangur
(hvaðan kom hugmyndin?)
Eitt helsta áhugamál hjá mér er að hlusta á plötur. Eitt vandamál sem ég hef er að ég hef ekki ennþá fundið góða leið til að halda utan um plöturnar mínar. Ég hef mikið skipt milli streymisveita, og finnst alltaf skorta leiðir til að leita í gegnum og flokka plötur sem maður hefur hlustað á. **Plata** er ekki fullkomin lausn, ekki ennþá allavega, en það er allavega byrjun á minni tilraun að leysa þetta vandamál.

## Útfærsla
(hvaða skylirði eru uppfyllt og af hverju?)

Notandinn skráir sig inn með notandanafni/lykilorði (bcrypt hash) eða GitHub/Google OAuth. Sessions eru geymd í gagnagrunninum með 30 mínútna expiry og vísað til með HTTP-only cookie. Á leitarsíðunni er leitin debounced (400 ms) og skeleton-shimmer plötur birtast á meðan beðið er eftir search results. Niðurstöðurnar eru album covers með texta. Við mouse-hover á plötunum kemur "+" takki, sem opnar valmynd þar sem hægt er að bæta plötu í safn eða á "hlusta seinna"-lista. Plötugögnin sjálf eru geymd í Album töflu svo við þurfum ekki að kalla aftur á Last.fm næst þegar safnið er birt.  Safnið styður tvö útlit: grid og töflu. Hægt er að raða eftir sjö dálkum, og hægt er að smella á dálk til að raða töflunni eftir viðkomandi dálki. Fyrir ofan listann birtist tölfræði: heildarfjöldi, hlustað, á að hlusta, meðaleinkunn. Smellur á plötu opnar plötusíðuna þar sem hægt er að uppfæra stöðu, einkunn og umsögn: gögnin eru komin með í gegnum react-router state svo síðan birtist strax. Allar API-aðgerðir eru varðar með auth-middleware. 

Síðan á að vera mínímalísk og straight-forward, og með fókus á plöturnar, sem eru hjarta síðunnar. Upphaflega hafði ég meiri upplýsingar um plöturnar eftir leit, og hafði textann fyrir neðan hverja plötu. En fannst það alltof cluttered. En núna liggur textinn ofan á plötunum, sem gera plöturnar að aðaláherslu síðunnar. 
## Tækni
(hvaða tækni er notuð og af hverju)

- Hono: Þægilegur web framework sem ég er vanur að nota síðan úr fyrrir verkefnum þessa námskeiðs.
- Prisma: Gott að geta migrate-að á mismunandi db, ef ég vildi t.d. búa til Plötu mobile app. En valdi það aðalega þar sem að ég kunni á það nú þegar út af fyrri verkefnum námskeiðs.
- React + React Router + Vite: Þæginlegt að vinna með componenta og pages í React, Vite superfast.
- Tailwind: Langaði alltaf að læra á eitthvað css framework - hef aldrei verið aðdáandi að "vanilla" css en finnst annars skemmtilegt að vinna með viðmót almennt í vefforritun.  
- Arctic: OAuth client fyrir GitHub og Google.
- bcryptjs: hashun á lykilorðum.
- Vitest + Testing Library: sama test runner fyrir server og client, aðskilið umhverfi (node fyrir src/, jsdom fyrir client/src/).                                             
- Railway: hýsing fyrir frontend, backend og postgres gagnagrunn.
- Karrik letur: Eitthvað free to use letur sem ég fann.
- Last.fm API

Upprunalega notaði ég MusicBrainz, en ég skipti yfir í Last.fm API útaf nokkrum ástæðum. Helsta ástæðan er sú að genre tags sem MusicBrainz skilar (music categories sem að MusicBrainz skilar með plötu) eru mjög léleg. Tags á MusicBrainz eru bara user contributions, þannig að það er fullt af plötum þar inni sem hafa ekkert genre. Önnur ástæða er sú að mig langaði að útfæra server-wide rate limiting (einn daginn). MusicBrainz leyfir aðeins 1 API kall á sekúndu. Ef ég er kominn með nokkra notendur á sama tíma er það strax orðið vandamál, fólk gæti þurft að bíða soldið lengi eftir search results. Last.fm leyfir 5 API köll á sekúndu, sem er ekki fullkomið, en samt margfalt betra en 1 API kall á sekúndu, og ennþá frítt. 

## Hvað gekk vel
Uppsetning á external API er eitthvað sem mig hafði lengi langað að prófa og hélt að væri mikið mál. í þessu verkefni komst ég að því að í mörgum tilvikum er það lítið sem ekkert mál! Þarf bara að passa upp á að hjóla ekki fyrir rate limit sem API gefur upp og þá er ég góður.
## Hvað gekk illa
Uppsetning á railway gekk ekki vel. Ég man ekki lengur hvað nákvæmlega vandamálið var, og hef ekki lengur aðgengi að build/deploy logs. En það var meðal annars eitthvað væl frá railway um að `package.json` væri ekki nógu gott. Síðan þurfti ég að breyta custom build og start commands, prófaði ótal margar samsetningar af build og start commands áður en það byrjaði loksins að virka. 
![[screenshot-2026-04-15_00-58-28.png]]
## Hvað var áhugavert
EIns og ég minntist á hefur mig alltaf langað að læra á eitthvað css framework, og þótti skemmtilegt að kynnast tailwind. Það er þægilegra og fjlótlegra að útfæra allt styling, að mínu mati, þegar það fer beint inn í html componentana. Í stað þess að þurfa að finna út úr selectorum, og passa upp á að maður sé ekki óvart að velja eitthvað sem maður vildi ekki velja. Ég mun líklegast halda áfram að fikta með Tailwind ef/þegar ég held áfram með þessa síður.


