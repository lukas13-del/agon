// Programmdaten: Greek God Program 2.0, eigene Zusammenfassung auf Deutsch.
// eq: bb Langhantel, db Kurzhantel (Gewicht pro Hand), wbw Zusatzgewicht am Gürtel,
//     bw Körpergewicht (optional Zusatzlast), cable Kabelzug, machine Maschine, plate Hantelscheibe

export const EX = {
  inc_bb_press: { name: 'Schrägbankdrücken Langhantel', eq: 'bb', muscles: 'Obere Brust, vordere Schulter, Trizeps',
    steps: ['Bank auf etwa 30° stellen, Schulterblätter zusammen und nach unten ziehen.', 'Stange etwas breiter als schulterbreit greifen, Ellbogen etwa 45° vom Körper.', 'Kontrolliert bis knapp unter das Schlüsselbein absenken.', 'Kraftvoll nach oben drücken, bis die Arme gestreckt sind.'],
    tips: ['Kein Hohlkreuz, Gesäss bleibt auf der Bank.', 'Stange nicht auf der Brust abfedern.'] },
  standing_press: { name: 'Schulterdrücken stehend', eq: 'bb', muscles: 'Schultern, Trizeps, Rumpf',
    steps: ['Stange auf Schulterhöhe vor dem Hals, Griff knapp schulterbreit.', 'Gesäss und Bauch anspannen, Füsse hüftbreit.', 'Stange senkrecht über den Kopf drücken, Kopf leicht zurück und dann wieder unter die Stange.', 'Kontrolliert zurück auf Schulterhöhe.'],
    tips: ['Nicht nach hinten lehnen.', 'Knie bleiben gestreckt, kein Schwung aus den Beinen.'] },
  rope_pushdown: { name: 'Trizepsdrücken am Seil', eq: 'cable', muscles: 'Trizeps',
    steps: ['Seil am oberen Kabelzug, aufrecht stehen.', 'Oberarme eng am Körper fixieren.', 'Seil nach unten drücken und die Enden am Schluss leicht auseinanderziehen.', 'Langsam zurück, bis die Unterarme waagrecht sind.'],
    tips: ['Ellbogen bewegen sich nicht nach vorne.', 'Oberkörper ruhig halten.'] },
  lateral_raise: { name: 'Seitheben Kurzhantel', eq: 'db', muscles: 'Seitliche Schulter',
    steps: ['Aufrecht stehen, Kurzhanteln seitlich neben den Oberschenkeln.', 'Arme leicht gebeugt seitlich anheben bis auf Schulterhöhe.', 'Kleiner Finger leicht höher als der Daumen.', 'Langsam absenken.'],
    tips: ['Kein Schwung aus dem Oberkörper.', 'Schultern nicht zu den Ohren ziehen.'] },
  hanging_knee_raise: { name: 'Knieheben hängend', eq: 'bw', muscles: 'Bauch, Hüftbeuger',
    steps: ['An die Klimmzugstange hängen, Schultern aktiv.', 'Knie zur Brust ziehen und das Becken einrollen.', 'Kurz halten.', 'Langsam ohne Schwung absenken.'],
    tips: ['Nicht pendeln.', 'Zu leicht? Kurzhantel zwischen die Füsse klemmen.'] },
  weighted_chinup: { name: 'Klimmzüge Untergriff + Gewicht', eq: 'wbw', muscles: 'Breiter Rücken, Bizeps',
    steps: ['Zusatzgewicht am Dip-Gürtel, Untergriff schulterbreit.', 'Aus dem gestreckten Hang starten, Schulterblätter nach unten ziehen.', 'Hochziehen, bis das Kinn über der Stange ist.', 'Kontrolliert ganz absenken.'],
    tips: ['Volle Bewegung, unten ganz strecken.', 'Nicht mit den Beinen schwingen.'] },
  inc_hammer_curl: { name: 'Hammer-Curls Schrägbank', eq: 'db', muscles: 'Bizeps, Unterarm',
    steps: ['Auf die Schrägbank (ca. 45°) setzen, Arme hängen gestreckt.', 'Neutraler Griff, Daumen zeigen nach oben.', 'Kurzhanteln nach oben curlen, Oberarme bleiben still.', 'Langsam ganz absenken.'],
    tips: ['Ellbogen nicht nach vorne ziehen.', 'Unten ganz strecken.'] },
  bulgarian: { name: 'Bulgarian Split Squats', eq: 'db', muscles: 'Oberschenkel, Gesäss',
    steps: ['Hinteren Fuss auf eine Bank legen, Kurzhanteln seitlich halten.', 'Vorderer Fuss so weit vorne, dass das Knie über dem Fuss bleibt.', 'Senkrecht absenken, bis der vordere Oberschenkel waagrecht ist.', 'Über die Ferse des vorderen Fusses hochdrücken.'],
    tips: ['Oberkörper aufrecht.', 'Beide Beine gleich viele Wiederholungen.'] },
  db_rdl: { name: 'Rumänisches Kreuzheben Kurzhantel', eq: 'db', muscles: 'Hintere Oberschenkel, Gesäss, unterer Rücken',
    steps: ['Hüftbreit stehen, Kurzhanteln vor den Oberschenkeln.', 'Knie leicht gebeugt, Hüfte nach hinten schieben.', 'Hanteln nah an den Beinen bis unter die Knie absenken, Rücken gerade.', 'Hüfte nach vorne bringen und aufrichten.'],
    tips: ['Rücken nie rund machen.', 'Dehnung hinten im Oberschenkel spüren.'] },
  face_pull: { name: 'Face Pulls', eq: 'cable', muscles: 'Hintere Schulter, mittlerer Trapez',
    steps: ['Seil am Kabelzug auf Gesichtshöhe.', 'Mit Obergriff fassen, einen Schritt zurück.', 'Seil zum Gesicht ziehen, Hände auseinander, Ellbogen hoch.', 'Kontrolliert zurück.'],
    tips: ['Schulterblätter zusammenziehen.', 'Nicht mit dem Oberkörper zurücklehnen.'] },
  inc_db_press: { name: 'Schrägbankdrücken Kurzhantel', eq: 'db', muscles: 'Obere Brust, vordere Schulter, Trizeps',
    steps: ['Bank auf etwa 30°, Kurzhanteln auf Brusthöhe.', 'Ellbogen etwa 45° vom Körper.', 'Hanteln nach oben drücken, oben leicht zusammenführen.', 'Langsam tief absenken.'],
    tips: ['Schulterblätter bleiben zusammen.', 'Hanteln oben nicht zusammenschlagen.'] },
  weighted_dip: { name: 'Dips + Gewicht', eq: 'wbw', muscles: 'Untere Brust, Trizeps, Schultern',
    steps: ['Zusatzgewicht am Gürtel, gestreckt auf den Barren stützen.', 'Oberkörper leicht nach vorne neigen.', 'Absenken, bis die Oberarme etwa waagrecht sind.', 'Kraftvoll nach oben drücken.'],
    tips: ['Schultern nicht nach vorne fallen lassen.', 'Schmerzt die Schulter, weniger tief gehen.'] },
  oh_tri_ext_1arm: { name: 'Trizepsstrecken einarmig über Kopf', eq: 'db', muscles: 'Trizeps (langer Kopf)',
    steps: ['Sitzend oder stehend eine Kurzhantel über den Kopf strecken.', 'Oberarm neben dem Kopf fixieren.', 'Hantel hinter dem Kopf absenken.', 'Wieder ganz strecken. Dann Seite wechseln.'],
    tips: ['Ellbogen zeigt nach oben, nicht zur Seite.', 'Rumpf stabil halten.'] },
  db_upright_row: { name: 'Upright Rows Kurzhantel', eq: 'db', muscles: 'Seitliche Schulter, Trapez',
    steps: ['Kurzhanteln vor den Oberschenkeln halten.', 'Ellbogen voraus seitlich nach oben ziehen.', 'Bis etwa Brusthöhe, Ellbogen höher als die Hände.', 'Langsam absenken.'],
    tips: ['Nicht höher als Schulterhöhe ziehen.', 'Kein Schwung.'] },
  side_knee_up: { name: 'Knieheben seitlich', eq: 'bw', muscles: 'Seitliche Bauchmuskeln',
    steps: ['An die Klimmzugstange hängen.', 'Knie seitlich zur rechten Schulter ziehen.', 'Absenken und zur linken Seite wiederholen.', 'Wiederholungen zählen pro Seite.'],
    tips: ['Ruhig und ohne Pendeln.', 'Zu leicht? Leichte Hantel zwischen die Knie.'] },
  weighted_pullup: { name: 'Klimmzüge Obergriff + Gewicht', eq: 'wbw', muscles: 'Breiter Rücken, hintere Schulter',
    steps: ['Zusatzgewicht am Gürtel, Obergriff etwas breiter als schulterbreit.', 'Aus dem gestreckten Hang Schulterblätter nach unten ziehen.', 'Hochziehen, bis das Kinn über der Stange ist.', 'Kontrolliert ganz absenken.'],
    tips: ['Brust zur Stange, nicht nur das Kinn.', 'Unten ganz strecken.'] },
  inc_db_curl: { name: 'Curls Schrägbank', eq: 'db', muscles: 'Bizeps',
    steps: ['Auf die Schrägbank (ca. 45°) setzen, Arme hängen gestreckt.', 'Untergriff, Handflächen nach vorne.', 'Hanteln nach oben curlen, Oberarme bleiben hinten.', 'Langsam ganz absenken.'],
    tips: ['Unten volle Streckung.', 'Kein Schwung aus den Schultern.'] },
  box_squat: { name: 'Box Squats', eq: 'bb', muscles: 'Oberschenkel, Gesäss',
    steps: ['Box oder Bank auf Kniehöhe hinter dich stellen, Stange auf dem oberen Rücken.', 'Hüfte nach hinten, kontrolliert absenken.', 'Kurz auf der Box absitzen, Spannung halten.', 'Explosiv aufstehen.'],
    tips: ['Nicht auf die Box fallen lassen.', 'Knie zeigen in Richtung Zehen.'] },
  sl_rdl: { name: 'Einbeiniges rumänisches Kreuzheben', eq: 'db', muscles: 'Hintere Oberschenkel, Gesäss, Balance',
    steps: ['Auf einem Bein stehen, Kurzhantel in der Gegenhand.', 'Oberkörper nach vorne neigen, freies Bein streckt nach hinten.', 'Bis der Oberkörper fast waagrecht ist.', 'Über das Standbein aufrichten.'],
    tips: ['Hüfte bleibt gerade, nicht aufdrehen.', 'Wiederholungen pro Bein.'] },
  hip_thrust: { name: 'Hip Thrusts', eq: 'bb', muscles: 'Gesäss, hintere Oberschenkel',
    steps: ['Oberer Rücken an einer Bank, Stange gepolstert auf der Hüfte.', 'Füsse hüftbreit, Knie etwa 90°.', 'Hüfte nach oben drücken, bis Körper und Oberschenkel eine Linie bilden.', 'Oben Gesäss anspannen, langsam absenken.'],
    tips: ['Kein Hohlkreuz oben.', 'Kinn leicht zur Brust.'] },
  seated_rev_fly: { name: 'Reverse Flys vorgebeugt', eq: 'db', muscles: 'Hintere Schulter, oberer Rücken',
    steps: ['Am Bankende sitzen, Oberkörper weit nach vorne gebeugt.', 'Kurzhanteln hängen unter den Beinen.', 'Arme leicht gebeugt seitlich anheben.', 'Langsam absenken.'],
    tips: ['Leichtes Gewicht, saubere Bewegung.', 'Nicht mit dem Oberkörper hochkommen.'] },
  close_grip_bench: { name: 'Bankdrücken eng', eq: 'bb', muscles: 'Trizeps, Brust',
    steps: ['Flach auf der Bank, Griff schulterbreit.', 'Ellbogen nah am Körper.', 'Stange zur unteren Brust absenken.', 'Nach oben drücken.'],
    tips: ['Griff nicht zu eng, das belastet die Handgelenke.', 'Schulterblätter zusammen.'] },
  cable_crossover: { name: 'Cable Crossover', eq: 'cable', muscles: 'Brust',
    steps: ['Zwischen zwei Kabelzügen stehen, Griffe auf Schulterhöhe oder höher.', 'Kleiner Ausfallschritt, Oberkörper leicht vor.', 'Arme leicht gebeugt im Bogen vor der Brust zusammenführen.', 'Langsam zurück in die Dehnung.'],
    tips: ['Ellbogenwinkel bleibt gleich.', 'Brust anspannen, nicht mit den Armen drücken.'] },
  cable_row: { name: 'Kabelrudern sitzend', eq: 'cable', muscles: 'Mittlerer Rücken, Bizeps',
    steps: ['Aufrecht sitzen, Füsse an der Platte, Knie leicht gebeugt.', 'Griff zum Bauch ziehen.', 'Schulterblätter zusammenziehen.', 'Kontrolliert nach vorne strecken.'],
    tips: ['Nicht mit dem Oberkörper schwingen.', 'Brust raus.'] },
  machine_curl: { name: 'Bizepscurls Maschine', eq: 'machine', muscles: 'Bizeps',
    steps: ['Sitz so einstellen, dass die Ellbogen auf dem Polster mit der Drehachse übereinstimmen.', 'Griffe fassen.', 'Nach oben curlen.', 'Langsam ganz strecken.'],
    tips: ['Ganze Bewegung nutzen.', 'Kein Schwung.'] },
  shrug: { name: 'Shrugs Kurzhantel', eq: 'db', muscles: 'Oberer Trapez',
    steps: ['Kurzhanteln seitlich halten, aufrecht stehen.', 'Schultern gerade nach oben zu den Ohren ziehen.', 'Oben kurz halten.', 'Langsam absenken.'],
    tips: ['Schultern nicht kreisen.', 'Arme bleiben gestreckt.'] },
  machine_press: { name: 'Brustpresse Maschine', eq: 'machine', muscles: 'Brust, Trizeps',
    steps: ['Sitz so einstellen, dass die Griffe auf Brusthöhe sind.', 'Schulterblätter an die Lehne.', 'Griffe nach vorne drücken.', 'Langsam zurück bis zur Dehnung.'],
    tips: ['Arme oben nicht ganz durchdrücken.', 'Schultern bleiben unten.'] },
  db_oh_tri_ext: { name: 'Trizepsstrecken über Kopf, beidarmig', eq: 'db', muscles: 'Trizeps',
    steps: ['Eine Kurzhantel mit beiden Händen über dem Kopf halten.', 'Oberarme neben dem Kopf.', 'Hantel hinter dem Kopf absenken.', 'Wieder strecken.'],
    tips: ['Ellbogen zeigen nach vorne-oben.', 'Bauch anspannen.'] },
  machine_row: { name: 'Rudern Maschine', eq: 'machine', muscles: 'Mittlerer Rücken',
    steps: ['Brust ans Polster, Griffe fassen.', 'Griffe zum Körper ziehen.', 'Schulterblätter zusammenziehen.', 'Langsam zurück.'],
    tips: ['Brust bleibt am Polster.', 'Ellbogen nah am Körper.'] },
  cable_rope_curl: { name: 'Curls am Seil', eq: 'cable', muscles: 'Bizeps, Unterarm',
    steps: ['Seil am unteren Kabelzug, aufrecht stehen.', 'Oberarme am Körper.', 'Seil zur Brust curlen.', 'Langsam strecken.'],
    tips: ['Ellbogen bleiben still.', 'Kein Schwung.'] },
  flat_db_press: { name: 'Bankdrücken Kurzhantel flach', eq: 'db', muscles: 'Brust, Trizeps',
    steps: ['Flach auf der Bank, Kurzhanteln auf Brusthöhe.', 'Ellbogen etwa 45°.', 'Hanteln nach oben drücken.', 'Langsam tief absenken.'],
    tips: ['Schulterblätter zusammen.', 'Kontrolliert absenken.'] },
  flat_bb_bench: { name: 'Bankdrücken Langhantel', eq: 'bb', muscles: 'Brust, Trizeps, vordere Schulter',
    steps: ['Flach auf der Bank, Augen unter der Stange.', 'Griff etwas breiter als schulterbreit.', 'Stange zur Brustmitte absenken.', 'Nach oben drücken.'],
    tips: ['Füsse fest am Boden.', 'Stange nicht abfedern.'] },
  skull_crusher: { name: 'Skull Crushers', eq: 'bb', muscles: 'Trizeps',
    steps: ['Flach auf der Bank, SZ-Stange über der Brust.', 'Oberarme leicht nach hinten geneigt fixieren.', 'Stange zur Stirn oder hinter den Kopf absenken.', 'Wieder strecken.'],
    tips: ['Ellbogen nicht ausstellen.', 'Langsam absenken.'] },
  bb_curl: { name: 'Langhantel-Curls', eq: 'bb', muscles: 'Bizeps',
    steps: ['Aufrecht stehen, Untergriff schulterbreit.', 'Oberarme am Körper.', 'Stange zur Brust curlen.', 'Langsam ganz absenken.'],
    tips: ['Kein Schwung aus dem Rücken.', 'Unten ganz strecken.'] },
  sumo_dl: { name: 'Sumo-Kreuzheben', eq: 'bb', muscles: 'Beine, Gesäss, Rücken, Trapez',
    steps: ['Breiter Stand, Füsse ausserhalb der Hände, Zehen leicht nach aussen.', 'Stange über der Fussmitte, schulterbreit greifen.', 'Rücken gerade, Brust hoch, Stange nah am Körper hochziehen.', 'Oben Hüfte strecken, kontrolliert absetzen.'],
    tips: ['Nie mit rundem Rücken ziehen.', 'Schwerster Satz bei ca. 90 %, nicht bis zum Versagen.'] },
  weighted_cg_chinup: { name: 'Klimmzüge eng Untergriff + Gewicht', eq: 'wbw', muscles: 'Bizeps, breiter Rücken',
    steps: ['Zusatzgewicht am Gürtel, Untergriff eng (ca. 15 cm).', 'Aus dem gestreckten Hang starten.', 'Hochziehen, bis das Kinn über der Stange ist.', 'Kontrolliert absenken.'],
    tips: ['Ganz strecken.', 'Kein Schwung.'] },
  pistol: { name: 'Pistol Squats', eq: 'bw', muscles: 'Oberschenkel, Gesäss, Balance',
    steps: ['Auf einem Bein stehen, anderes Bein nach vorne gestreckt.', 'Arme nach vorne, langsam tief absenken.', 'Ferse bleibt am Boden.', 'Über das Standbein hochdrücken.'],
    tips: ['Anfangs an einer Stange festhalten.', 'Wiederholungen pro Bein.'] },
  squat: { name: 'Kniebeugen Langhantel', eq: 'bb', muscles: 'Oberschenkel, Gesäss',
    steps: ['Stange auf dem oberen Rücken, schulterbreiter Stand.', 'Hüfte nach hinten, Knie Richtung Zehen.', 'Mindestens bis die Oberschenkel waagrecht sind.', 'Kraftvoll aufstehen.'],
    tips: ['Rücken gerade, Brust hoch.', 'Fersen bleiben am Boden.'] },
  rope_oh_ext: { name: 'Trizepsstrecken über Kopf am Seil', eq: 'cable', muscles: 'Trizeps',
    steps: ['Mit dem Rücken zum Kabelzug, Seil über dem Kopf.', 'Oberarme neben dem Kopf.', 'Seil nach vorne-oben strecken.', 'Langsam zurück in die Dehnung.'],
    tips: ['Ellbogen bleiben fixiert.', 'Pause 60 bis 90 Sekunden.'] },
  walking_lunge: { name: 'Ausfallschritte gehend', eq: 'bb', muscles: 'Oberschenkel, Gesäss',
    steps: ['Stange auf dem oberen Rücken.', 'Grosser Schritt nach vorne, hinteres Knie fast zum Boden.', 'Über das vordere Bein hochdrücken und den nächsten Schritt machen.', 'Wiederholungen pro Bein zählen.'],
    tips: ['Oberkörper aufrecht.', 'Vorderes Knie bleibt über dem Fuss.'] },
  cable_shrug: { name: 'Shrugs am Kabel', eq: 'cable', muscles: 'Oberer Trapez',
    steps: ['Griffe am unteren Kabelzug, aufrecht stehen.', 'Schultern nach oben zu den Ohren ziehen.', 'Oben kurz halten.', 'Langsam absenken.'],
    tips: ['Arme bleiben gestreckt.', 'Nicht kreisen.'] },
  neck_ext: { name: 'Nackenstrecken', eq: 'plate', muscles: 'Nackenmuskulatur hinten',
    steps: ['Bauchlage auf der Bank, Kopf über das Ende hinaus.', 'Leichte Scheibe mit einem Tuch auf den Hinterkopf legen und halten.', 'Kopf langsam nach oben strecken.', 'Kontrolliert absenken.'],
    tips: ['Leicht beginnen, nie bis zum Versagen.', 'Nur der Nacken bewegt sich.'] },
  neck_curl: { name: 'Nackencurls', eq: 'plate', muscles: 'Nackenmuskulatur vorne',
    steps: ['Rückenlage auf der Bank, Kopf über das Ende hinaus.', 'Leichte Scheibe mit einem Tuch auf der Stirn halten.', 'Kinn zur Brust ziehen.', 'Langsam zurück.'],
    tips: ['Leicht beginnen.', 'Ruhig und kontrolliert.'] },
  standing_hammer: { name: 'Hammer-Curls stehend', eq: 'db', muscles: 'Bizeps, Unterarm',
    steps: ['Aufrecht stehen, Kurzhanteln im neutralen Griff.', 'Oberarme am Körper.', 'Hanteln nach oben curlen.', 'Langsam absenken.'],
    tips: ['Kein Schwung.', 'Unten ganz strecken.'] },
  arnold: { name: 'Arnold Press', eq: 'db', muscles: 'Schultern, Trizeps',
    steps: ['Sitzend, Kurzhanteln vor der Brust, Handflächen zu dir.', 'Beim Hochdrücken die Hände nach aussen drehen.', 'Oben strecken, Handflächen nach vorne.', 'Beim Absenken zurückdrehen.'],
    tips: ['Rücken an der Lehne.', 'Ruhige Drehbewegung.'] },
  seated_hammer: { name: 'Hammer-Curls sitzend', eq: 'db', muscles: 'Bizeps, Unterarm',
    steps: ['Aufrecht auf der Bank sitzen, Kurzhanteln im neutralen Griff.', 'Oberarme am Körper.', 'Hanteln nach oben curlen.', 'Langsam absenken.'],
    tips: ['Kein Schwung.', 'Volle Bewegung.'] },
  machine_rear_delt: { name: 'Reverse Flys Maschine', eq: 'machine', muscles: 'Hintere Schulter',
    steps: ['Brust ans Polster der Butterfly-Maschine.', 'Griffe mit gestreckten Armen fassen.', 'Arme im Bogen nach hinten führen.', 'Langsam zurück.'],
    tips: ['Schultern unten lassen.', 'Leichtes Gewicht, saubere Bewegung.'] },
  front_squat: { name: 'Frontkniebeugen', eq: 'bb', muscles: 'Vordere Oberschenkel, Rumpf',
    steps: ['Stange vorne auf den Schultern, Ellbogen hoch.', 'Aufrecht tief absenken.', 'Knie Richtung Zehen.', 'Kraftvoll aufstehen.'],
    tips: ['Ellbogen bleiben oben.', 'Oberkörper aufrecht.'] },
  straight_arm_pulldown: { name: 'Überzüge am Kabel', eq: 'cable', muscles: 'Breiter Rücken (Lat)',
    steps: ['Vor dem oberen Kabelzug stehen, Stange oder Seil mit gestreckten Armen fassen.', 'Leicht nach vorne lehnen, Arme bleiben fast gestreckt.', 'Griff im Bogen bis zu den Oberschenkeln ziehen.', 'Langsam zurück, bis die Arme über Kopfhöhe sind.'],
    tips: ['Die Bewegung kommt aus der Schulter, nicht aus den Ellbogen.', 'Lat unten bewusst anspannen.'] },
  lat_pulldown: { name: 'Latzug eng', eq: 'cable', muscles: 'Breiter Rücken, Bizeps',
    steps: ['Oberschenkel unter dem Polster fixieren, engen Griff fassen.', 'Brust raus, leicht zurücklehnen.', 'Griff zur oberen Brust ziehen, Ellbogen nach unten.', 'Kontrolliert ganz nach oben strecken.'],
    tips: ['Nicht mit dem Oberkörper reissen.', 'Oben volle Dehnung im Rücken.'] },
  cable_lateral: { name: 'Seitheben am Kabel, einarmig', eq: 'cable', muscles: 'Seitliche Schulter',
    steps: ['Seitlich zum unteren Kabelzug stehen, Griff mit der äusseren Hand.', 'Arm leicht gebeugt seitlich bis Schulterhöhe heben.', 'Kurz halten.', 'Langsam absenken. Dann Seite wechseln.'],
    tips: ['Das Kabel hält die Spannung auch unten.', 'Oberkörper ruhig, kein Schwung.'] },
  cable_fly_low: { name: 'Kabel-Flys von unten', eq: 'cable', muscles: 'Obere Brust',
    steps: ['Griffe am unteren Kabelzug, Schritt nach vorne.', 'Arme leicht gebeugt, Handflächen nach vorne-oben.', 'Im Bogen nach oben vor das Gesicht führen.', 'Langsam zurück in die Dehnung.'],
    tips: ['Ellbogenwinkel bleibt gleich.', 'Obere Brust bewusst anspannen.'] },
  cable_crunch: { name: 'Kabel-Crunch', eq: 'cable', muscles: 'Gerader Bauchmuskel',
    steps: ['Vor dem oberen Kabelzug knien, Seil neben dem Kopf halten.', 'Hüfte bleibt fest.', 'Oberkörper einrollen, Ellbogen Richtung Knie.', 'Kontrolliert zurück.'],
    tips: ['Die Bewegung kommt aus dem Bauch, nicht aus der Hüfte.', 'Unten kurz anspannen.'] },
  pallof: { name: 'Pallof Press', eq: 'cable', muscles: 'Rumpf, seitlicher Bauch',
    steps: ['Seitlich zum Kabelzug auf Brusthöhe stehen, Griff mit beiden Händen vor der Brust.', 'Bauch anspannen.', 'Arme gerade nach vorne strecken, ohne dass der Oberkörper dreht.', 'Zurückführen. Wiederholungen je Seite.'],
    tips: ['Becken und Schultern bleiben gerade.', 'Ruhig atmen.'] },
  side_plank: { name: 'Seitstütz', eq: 'bw', unit: 's', muscles: 'Seitlicher Bauch, Rumpf',
    steps: ['Seitlich auf den Unterarm stützen, Ellbogen unter der Schulter.', 'Hüfte heben, Körper bildet eine Linie.', 'Position halten.', 'Seite wechseln. Zeit je Seite.'],
    tips: ['Hüfte nicht absinken lassen.', 'Zu leicht? Oberes Bein anheben.'] },
  farmer_walk: { name: "Farmer's Walk", eq: 'db', unit: 's', muscles: 'Griff, Unterarm, Trapez, Rumpf',
    steps: ['Zwei schwere Kurzhanteln seitlich aufnehmen.', 'Aufrecht stehen, Schultern zurück.', 'Mit kurzen, schnellen Schritten gehen.', 'Hanteln kontrolliert absetzen.'],
    tips: ['Nicht nach vorne lehnen.', 'Griff fest, Bauch angespannt.'] },
  dead_hang: { name: 'Hängen an der Stange', eq: 'none', unit: 's', muscles: 'Schultern, Griff, Wirbelsäule',
    steps: ['Stange schulterbreit greifen.', 'Locker hängen lassen, Schultern dürfen hochrutschen.', 'Ruhig atmen.', 'Kontrolliert loslassen.'],
    tips: ['Füsse dürfen den Boden leicht berühren, wenn es zu streng ist.', 'Entlastet die Wirbelsäule nach dem Sitzen.'] },
  thoracic_rot: { name: 'Brustwirbel-Rotation', eq: 'none', muscles: 'Brustwirbelsäule',
    steps: ['Seitlich liegen, Knie angewinkelt, Arme gestreckt übereinander.', 'Oberen Arm im Bogen auf die andere Seite öffnen.', 'Blick folgt der Hand, Knie bleiben am Boden.', 'Zurück. Wiederholungen je Seite.'],
    tips: ['Langsam ausatmen beim Öffnen.', 'Nur so weit, wie es angenehm ist.'] },
  couch_stretch: { name: 'Couch Stretch', eq: 'none', unit: 's', muscles: 'Hüftbeuger, vorderer Oberschenkel',
    steps: ['Ein Knie vor einer Wand oder Bank auf den Boden, Fussrücken an der Wand.', 'Anderer Fuss vorne aufgestellt.', 'Gesäss anspannen und Oberkörper aufrichten.', 'Halten, dann Seite wechseln.'],
    tips: ['Kein Hohlkreuz, Becken leicht einrollen.', 'Polster unter das Knie legen.'] },
  hip_9090: { name: '90/90 Hüfte', eq: 'none', muscles: 'Hüftrotation',
    steps: ['Sitzen, beide Beine im 90-Grad-Winkel, eines vorne, eines seitlich.', 'Aufrecht sitzen.', 'Beide Knie auf die andere Seite drehen.', 'Wechseln. Wiederholungen je Seite.'],
    tips: ['Hände dürfen anfangs hinten stützen.', 'Langsam und kontrolliert.'] },
  wall_slide: { name: 'Wall Slides', eq: 'none', muscles: 'Schulterblätter, Haltung',
    steps: ['Rücken und Hinterkopf an die Wand, Arme in U-Haltung an der Wand.', 'Arme an der Wand nach oben schieben.', 'Kontakt zur Wand halten.', 'Langsam zurück.'],
    tips: ['Kein Hohlkreuz.', 'Nur so hoch wie mit Wandkontakt möglich.'] },
  deep_squat: { name: 'Tiefe Hocke', eq: 'none', unit: 's', muscles: 'Hüfte, Sprunggelenk, Rücken',
    steps: ['Schulterbreit stehen, Zehen leicht nach aussen.', 'So tief wie möglich in die Hocke.', 'Fersen am Boden, Brust hoch, Ellbogen drücken die Knie leicht nach aussen.', 'Halten und ruhig atmen.'],
    tips: ['Anfangs an einem Pfosten festhalten.', 'Kleine Gewichtsverlagerungen sind erlaubt.'] },
  lean_shrug: { name: 'Shrugs einarmig, angelehnt', eq: 'db', muscles: 'Oberer Trapez',
    steps: ['Eine Kurzhantel halten, mit der freien Hand an einer Stange abstützen und leicht seitlich lehnen.', 'Schulter nach oben und Richtung Ohr ziehen.', 'Oben kurz halten.', 'Langsam absenken. Dann Seite wechseln.'],
    tips: ['Schulter nach oben und leicht nach hinten, nicht nur gerade hoch.', 'Gewicht pro Satz steigern.'] },
};

// Satz-Vorlagen
// drop: Abzug pro Satz gegenüber dem vorherigen Satz
const rpt = (reps, rest = 180, drop = { pct: [0, 0.1, 0.1] }) => ({ type: 'rpt', sets: reps, rest, drop });
const kino = (n, lo, hi, rest = 120) => ({ type: 'kino', sets: Array(n).fill([lo, hi]), rest });
const rp = (lo = 12, hi = 15) => ({ type: 'rp', sets: [[lo, hi]], minis: 3, mini: [4, 6], rest: 15 });
const straight = (n, lo, hi, rest = 60) => ({ type: 'straight', sets: Array(n).fill([lo, hi]), rest });

const chinDrop = { kg: [0, 10, 10] };
const dipDrop = { kg: [0, 12.5, 12.5] };
const db2Drop = { kg: [0, 2, 2] };
const db4Drop = { kg: [0, 4, 4] };

const e = (ex, scheme, opts = {}) => ({ ex, ...scheme, ...opts });

// Bausteine
const SD1_A = [
  e('inc_bb_press', rpt([[4, 5], [6, 7], [8, 10]]), { warmup: 'bar', restAfter: 270 }),
  e('standing_press', rpt([[6, 8], [8, 10], [8, 10]]), { warmup: 'bar' }),
  e('rope_pushdown', rpt([[6, 8], [8, 10], [10, 12]], 120)),
  e('lateral_raise', rp()),
  e('hanging_knee_raise', straight(3, 8, 12)),
];
const SD1_B_UPPER = [
  e('weighted_chinup', rpt([[4, 4], [6, 6], [8, 8]], 180, chinDrop), { warmup: 'bw' }),
  e('inc_hammer_curl', rpt([[6, 8], [6, 8], [8, 10]], 120, db2Drop)),
];
const SD1_B_LEGS = [
  e('bulgarian', kino(4, 6, 8)),
  e('db_rdl', kino(4, 10, 12)),
];
const SD2_A = [
  e('inc_db_press', rpt([[6, 8], [8, 10], [10, 12]], 180, db4Drop), { warmup: 'bar' }),
  e('weighted_dip', rpt([[6, 6], [8, 8], [10, 10]], 180, dipDrop), { warmup: 'bw' }),
  e('oh_tri_ext_1arm', rpt([[8, 10], [10, 12], [12, 15]], 120, db2Drop)),
  e('db_upright_row', kino(4, 10, 15)),
  e('side_knee_up', straight(3, 8, 12)),
];
const SD2_B_UPPER = [
  e('weighted_pullup', rpt([[6, 6], [8, 8], [8, 8]], 180, chinDrop), { warmup: 'bw' }),
  e('inc_db_curl', rpt([[6, 8], [6, 8], [6, 8]], 120, db2Drop)),
];
const SD2_B_LEGS = [
  e('box_squat', kino(5, 6, 6)),
  e('sl_rdl', kino(3, 8, 12)),
];
const HEAVY_DL_1 = [e('sumo_dl', kino(5, 5, 5, 150)), e('bulgarian', kino(3, 6, 8))];
const HEAVY_DL_2 = [e('sumo_dl', kino(5, 5, 5, 150)), e('front_squat', kino(3, 6, 8))];

const SD1 = {
  A: { title: 'Workout A', focus: 'Brust, Schultern, Trizeps, Bauch', list: SD1_A },
  B: { title: 'Workout B', focus: 'Rücken, Bizeps, Beine', list: [...SD1_B_UPPER, ...SD1_B_LEGS, e('face_pull', kino(4, 12, 15))] },
  BD: { title: 'Workout B · Kreuzheben', focus: 'Rücken, Bizeps, schweres Kreuzheben', list: [...SD1_B_UPPER, ...HEAVY_DL_1, e('face_pull', kino(4, 12, 15))] },
};
const SD2 = {
  A: { title: 'Workout A', focus: 'Brust, Trizeps, Schultern, Bauch', list: SD2_A },
  B: { title: 'Workout B', focus: 'Rücken, Bizeps, Beine', list: [...SD2_B_UPPER, ...SD2_B_LEGS, e('seated_rev_fly', rp())] },
  BD: { title: 'Workout B · Kreuzheben', focus: 'Rücken, Bizeps, schweres Kreuzheben', list: [...SD2_B_UPPER, ...HEAVY_DL_2, e('seated_rev_fly', rp())] },
};
const MEGA1 = {
  A: { title: 'Workout A', focus: 'Brust, Schultern, Trizeps', list: [
    e('inc_db_press', rpt([[4, 6], [6, 8], [8, 10]], 180, db4Drop), { warmup: 'bar' }),
    e('close_grip_bench', rpt([[6, 8], [8, 10], [10, 12]])),
    e('cable_crossover', kino(4, 10, 12)),
    e('lateral_raise', rp()),
    e('rope_pushdown', kino(4, 10, 12)),
    e('hanging_knee_raise', straight(3, 8, 12), { optional: true }),
  ] },
  B: { title: 'Workout B', focus: 'Rücken, Bizeps, Beine', list: [
    e('weighted_pullup', rpt([[6, 6], [8, 8], [8, 8]], 180, chinDrop), { warmup: 'bw' }),
    e('inc_hammer_curl', rpt([[6, 8], [6, 8], [6, 8]], 120, db2Drop)),
    e('box_squat', kino(4, 6, 8)),
    e('hip_thrust', kino(4, 8, 10)),
    e('cable_row', kino(4, 10, 12)),
    e('machine_curl', kino(4, 10, 12)),
    e('shrug', kino(4, 10, 12), { optional: true }),
  ] },
};
const MEGA2 = {
  A: { title: 'Workout A', focus: 'Brust, Schultern, Trizeps', list: [
    e('inc_bb_press', rpt([[4, 6], [6, 8], [8, 10]]), { warmup: 'bar', restAfter: 270 }),
    e('standing_press', rpt([[6, 8], [8, 10], [10, 12]]), { warmup: 'bar' }),
    e('machine_press', kino(4, 10, 12)),
    e('db_oh_tri_ext', kino(4, 10, 12)),
    e('db_upright_row', kino(4, 12, 15)),
    e('hanging_knee_raise', straight(3, 8, 12)),
  ] },
  B: { title: 'Workout B', focus: 'Rücken, Bizeps, Beine', list: [
    e('weighted_chinup', rpt([[4, 4], [6, 6], [8, 8]], 180, chinDrop), { warmup: 'bw' }),
    e('inc_hammer_curl', rpt([[6, 8], [6, 8], [6, 8]], 120, db2Drop)),
    e('bulgarian', kino(4, 6, 8)),
    e('db_rdl', kino(4, 10, 12)),
    e('machine_row', kino(4, 10, 12)),
    e('cable_rope_curl', kino(4, 10, 12)),
  ] },
};

const five = { pct: [0, 0.1, 0.1, 0, 0] };
export const SPEC = {
  A: {
    brust: { label: 'Brust', list: [
      e('inc_bb_press', rpt([[5, 5], [6, 6], [8, 8], [8, 8], [8, 8]], 180, five), { warmup: 'bar', restAfter: 240 }),
      e('flat_db_press', rpt([[6, 6], [8, 8], [10, 10]], 180, db4Drop)),
      e('lateral_raise', straight(3, 8, 12, 90)),
      e('skull_crusher', straight(3, 6, 10, 120)),
    ] },
    schultern: { label: 'Schultern', list: [
      e('standing_press', rpt([[5, 5], [6, 6], [8, 8], [8, 8], [8, 8]], 180, five), { warmup: 'bar', restAfter: 240 }),
      e('weighted_dip', rpt([[5, 5], [6, 6], [8, 8]], 180, dipDrop), { warmup: 'bw' }),
      e('lateral_raise', straight(3, 8, 12, 90)),
      e('skull_crusher', straight(3, 8, 12, 120)),
    ] },
    trizeps: { label: 'Trizeps', list: [
      e('inc_bb_press', rpt([[5, 5], [6, 6], [8, 8]]), { warmup: 'bar', restAfter: 240 }),
      e('weighted_dip', rpt([[6, 6], [8, 8], [10, 10]], 180, dipDrop), { warmup: 'bw' }),
      e('lateral_raise', straight(3, 8, 12, 90)),
      e('skull_crusher', straight(3, 6, 10, 120)),
      e('rope_oh_ext', straight(2, 10, 12, 75)),
    ] },
  },
  B: {
    ruecken: { label: 'Rücken', list: [
      e('weighted_pullup', rpt([[5, 5], [6, 6], [8, 8], [8, 8], [8, 8]], 180, { kg: [0, 10, 10, 0, 0] }), { warmup: 'bw' }),
      e('sumo_dl', rpt([[5, 5], [6, 6], [8, 8]], 180)),
      e('seated_rev_fly', straight(3, 8, 12, 90)),
      e('bb_curl', straight(3, 6, 10, 120)),
    ] },
    bizeps: { label: 'Bizeps', list: [
      e('weighted_cg_chinup', rpt([[5, 5], [6, 6], [8, 8]], 180, chinDrop), { warmup: 'bw' }),
      e('bb_curl', straight(3, 6, 10, 120)),
      e('inc_db_curl', straight(2, 8, 12, 75)),
      e('seated_rev_fly', straight(3, 8, 12, 90)),
      e('pistol', straight(3, 3, 5, 90)),
    ] },
    beine: { label: 'Beine', list: [
      e('squat', rpt([[5, 5], [6, 6], [8, 8]]), { warmup: 'bar', restAfter: 240 }),
      e('weighted_chinup', rpt([[5, 5], [6, 6], [8, 8]], 180, chinDrop), { warmup: 'bw' }),
      e('seated_rev_fly', straight(3, 8, 12, 90)),
      e('bb_curl', straight(3, 6, 10, 120)),
    ] },
  },
};

const NECK_SPLIT = [e('neck_ext', kino(3, 20, 30, 90)), e('neck_curl', kino(3, 20, 30, 90))];
export const NECK_SAT = [e('lean_shrug', kino(4, 10, 15, 90)), e('neck_ext', kino(3, 20, 30, 90)), e('neck_curl', kino(3, 20, 30, 90))];

const SPLIT1 = {
  A: { title: 'Workout A', focus: 'Schultern, Rücken, Trizeps', list: [
    e('standing_press', rpt([[4, 6], [6, 8], [8, 10]]), { warmup: 'bar', restAfter: 240 }),
    e('weighted_chinup', rpt([[4, 4], [6, 6], [8, 8]], 180, chinDrop), { warmup: 'bw' }),
    e('cable_row', kino(4, 10, 12)),
    e('rope_pushdown', rpt([[6, 8], [8, 10], [10, 12]], 120)),
    e('lateral_raise', rp()),
  ] },
  B: { title: 'Workout B', focus: 'Beine, Trapez, Nacken', list: [
    e('box_squat', kino(5, 6, 8)),
    e('walking_lunge', kino(2, 8, 10)),
    e('db_rdl', kino(3, 10, 15)),
    e('cable_shrug', kino(3, 10, 15)),
    ...NECK_SPLIT,
  ] },
  C: { title: 'Workout C', focus: 'Brust, Bizeps, hintere Schulter', list: [
    e('inc_bb_press', rpt([[4, 5], [6, 8], [6, 8]]), { warmup: 'bar', restAfter: 240 }),
    e('weighted_dip', rpt([[6, 8], [8, 10]], 180, { kg: [0, 12.5] }), { warmup: 'bw' }),
    e('inc_db_curl', rpt([[6, 8], [6, 8], [6, 8], [6, 8]], 120, { kg: [0, 2, 2, 0] })),
    e('standing_hammer', kino(4, 8, 10)),
    e('face_pull', rp()),
  ] },
};
const SPLIT2 = {
  A: { title: 'Workout A', focus: 'Schultern, Rücken, Trizeps', list: [
    e('arnold', rpt([[6, 8], [8, 10], [10, 12]], 180, db2Drop), { warmup: 'bar' }),
    e('weighted_pullup', rpt([[6, 6], [8, 8], [8, 8]], 180, chinDrop), { warmup: 'bw' }),
    e('machine_row', kino(3, 10, 12)),
    e('oh_tri_ext_1arm', rpt([[8, 10], [10, 12], [10, 12]], 120, db2Drop)),
    e('db_upright_row', rp()),
  ] },
  B: { title: 'Workout B', focus: 'Beine, Trapez, Nacken', list: [
    e('sumo_dl', kino(5, 4, 6, 150)),
    e('bulgarian', kino(3, 6, 8)),
    e('cable_shrug', kino(3, 10, 15)),
    ...NECK_SPLIT,
  ] },
  C: { title: 'Workout C', focus: 'Brust, Bizeps, hintere Schulter', list: [
    e('inc_db_press', rpt([[6, 8], [8, 10], [10, 12]], 180, db4Drop), { warmup: 'bar', restAfter: 240 }),
    e('flat_bb_bench', rpt([[6, 8], [8, 10], [10, 12]]), { warmup: 'bar' }),
    e('seated_hammer', rpt([[6, 8], [6, 8], [6, 8], [6, 8]], 120, { kg: [0, 2, 2, 0] })),
    e('machine_curl', kino(4, 10, 12)),
    e('machine_rear_delt', rp()),
  ] },
};

// Plus-Blöcke (Agon Plus): Zusatzvolumen für die V-Form, ohne Waden
// Ohne Arm-Isolation: Bizeps und Trizeps bleiben auf dem Niveau des Buchs
const PLUS_A = [e('straight_arm_pulldown', straight(3, 10, 15, 75)), e('cable_lateral', straight(3, 12, 20, 60))];
const PLUS_B = [e('cable_fly_low', straight(3, 10, 15, 60)), e('lateral_raise', straight(3, 12, 20, 60)), e('cable_crunch', straight(3, 10, 15, 60))];
export const PLUS = {
  AB: { A: PLUS_A, B: PLUS_B, BD: PLUS_B },
  MEGA: { A: [e('cable_crunch', straight(3, 10, 15, 60))], B: [e('lateral_raise', straight(3, 12, 20, 60))] },
  ABC: {
    A: [e('cable_fly_low', straight(3, 10, 15, 60))],
    B: [e('lateral_raise', straight(3, 12, 20, 60)), e('cable_crunch', straight(3, 10, 15, 60))],
    C: [e('straight_arm_pulldown', straight(3, 10, 15, 75))],
  },
};

// 4. Tag: kurzer Feinschliff (Mo, sonst Fr)
export const FEIN = { title: 'Feinschliff', focus: 'Schultern, Brust, Rücken, Rumpf, Griff', list: [
  e('lateral_raise', straight(3, 15, 20, 60)),
  e('seated_rev_fly', straight(2, 12, 15, 60)),
  e('cable_fly_low', straight(2, 12, 15, 60)),
  e('straight_arm_pulldown', straight(2, 12, 15, 60)),
  e('pallof', straight(2, 10, 10, 45)),
  e('side_plank', straight(2, 30, 45, 30)),
  e('farmer_walk', straight(2, 30, 40, 90)),
] };

// Mobilitätsblock an freien Tagen, ca. 10 Minuten
export const MOB = { title: 'Mobilität', focus: 'Schultern, Hüfte, Wirbelsäule', list: [
  e('dead_hang', straight(2, 45, 45, 15)),
  e('thoracic_rot', straight(2, 8, 8, 15)),
  e('couch_stretch', straight(2, 60, 60, 10)),
  e('hip_9090', straight(2, 5, 5, 15)),
  e('wall_slide', straight(2, 12, 12, 15)),
  e('deep_squat', straight(1, 60, 60, 0)),
] };

// Blöcke in Reihenfolge. split: 'AB' wechselt A/B, 'ABC' rotiert. Nach jeder Phase eine Entlastungswoche.
const RAW = [
  { id: 'sd1', block: 'Strength & Density', phase: 'Phase 1 · Schulterfokus', weeks: 8, split: 'AB', w: SD1, deadlift: true, plus: 'AB' },
  { id: 'sd2', block: 'Strength & Density', phase: 'Phase 2 · Brustfokus', weeks: 8, split: 'AB', w: SD2, deadlift: true, plus: 'AB' },
  { id: 'sd3', block: 'Strength & Density', phase: 'Phase 3 · Schulterfokus', weeks: 8, split: 'AB', w: SD1, deadlift: true, plus: 'AB' },
  { id: 'mega1', block: 'MEGA', phase: 'Phase 1', weeks: 6, split: 'AB', w: MEGA1, plus: 'MEGA' },
  { id: 'mega2', block: 'MEGA', phase: 'Phase 2', weeks: 6, split: 'AB', w: MEGA2, plus: 'MEGA' },
  { id: 'spec', block: 'Spezialisierung', phase: 'Gewählte Muskelgruppen', weeks: 6, split: 'AB', spec: true, plus: 'AB' },
  { id: 'split1', block: '3er-Split', phase: 'Phase 1', weeks: 6, split: 'ABC', w: SPLIT1, noNeckSat: true, plus: 'ABC' },
  { id: 'split2', block: '3er-Split', phase: 'Phase 2', weeks: 6, split: 'ABC', w: SPLIT2, noNeckSat: true, plus: 'ABC' },
];
const RAW_LOOP = [
  { id: 'r_sd1', block: 'Runde 2+ · Strength & Density', phase: 'Phase 1 · Schulterfokus', weeks: 8, split: 'AB', w: SD1, deadlift: true, plus: 'AB' },
  { id: 'r_sd2', block: 'Runde 2+ · Strength & Density', phase: 'Phase 2 · Brustfokus', weeks: 8, split: 'AB', w: SD2, deadlift: true, plus: 'AB' },
  { id: 'r_mega1', block: 'Runde 2+ · MEGA', phase: 'Phase 1', weeks: 4, split: 'AB', w: MEGA1, plus: 'MEGA' },
  { id: 'r_mega2', block: 'Runde 2+ · MEGA', phase: 'Phase 2', weeks: 4, split: 'AB', w: MEGA2, plus: 'MEGA' },
];
const withDeloads = (list, last) => list.flatMap((b, j) => ((j === list.length - 1 && !last) ? [b]
  : [b, { ...b, id: `${b.id}_dl`, phase: 'Entlastungswoche', weeks: 1, deload: true, deadlift: false, noNeckSat: true, plus: null }]));
export const BLOCKS = withDeloads(RAW, false);
export const LOOP = withDeloads(RAW_LOOP, true);

export const MAIN_SESSIONS = BLOCKS.reduce((s, b) => s + b.weeks * 3, 0); // 183
export const MAIN_WEEKS = MAIN_SESSIONS / 3; // 61

export const RANKS = [
  { name: 'Sterblicher', gr: 'Thnetos', xp: 0 },
  { name: 'Schüler', gr: 'Mathetes', xp: 1500 },
  { name: 'Athlet', gr: 'Athletes', xp: 5000 },
  { name: 'Hoplit', gr: 'Hoplites', xp: 10000 },
  { name: 'Held', gr: 'Heros', xp: 17500 },
  { name: 'Olympionike', gr: 'Olympionikes', xp: 27500 },
  { name: 'Halbgott', gr: 'Hemitheos', xp: 40000 },
  { name: 'Titan', gr: 'Titan', xp: 55000 },
  { name: 'Olympier', gr: 'Olympios', xp: 75000 },
  { name: 'Gott', gr: 'Theos', xp: 100000 },
];

// Kraftstandards aus dem Buch. mode: 'ratio' = Gewicht / KG bei reps; 'added' = Zusatzgewicht / KG
export const STANDARDS = [
  { ex: 'inc_bb_press', label: 'Schrägbankdrücken', reps: 5, mode: 'ratio', lv: [1.0, 1.2, 1.4] },
  { ex: 'weighted_dip', label: 'Dips', reps: 6, mode: 'added', lv: [0.5, 0.75, 1.0] },
  { ex: 'weighted_chinup', label: 'Klimmzüge', reps: 5, mode: 'added', lv: [0.3, 0.5, 0.7] },
  { ex: 'standing_press', label: 'Schulterdrücken', reps: 5, mode: 'ratio', lv: [0.7, 0.85, 1.0] },
  { ex: 'bb_curl', label: 'Langhantel-Curl', reps: 5, mode: 'ratio', lv: [0.55, 0.65, 0.75] },
];
export const LABOURS = [
  { id: 'lion', name: 'Der Nemeische Löwe', text: 'Schrägbankdrücken mit dem eigenen Körpergewicht, 5 Wiederholungen' },
  { id: 'hydra', name: 'Die Hydra', text: '12 Wochen am Stück alle drei Trainings gemacht' },
  { id: 'hind', name: 'Die Kerynitische Hirschkuh', text: '5 km laufen unter 25 Minuten', manual: true },
  { id: 'boar', name: 'Der Erymanthische Eber', text: 'Sumo-Kreuzheben mit 1.75-fachem Körpergewicht, 5 Wiederholungen' },
  { id: 'augeas', name: 'Der Stall des Augias', text: '30 Mobilitätsblöcke gemacht' },
  { id: 'birds', name: 'Die Stymphalischen Vögel', text: '15 saubere Klimmzüge am Stück, ohne Zusatzgewicht', manual: true },
  { id: 'bull', name: 'Der Kretische Stier', text: 'Klimmzug mit 50 % Körpergewicht als Zusatz, 5 Wiederholungen' },
  { id: 'mares', name: 'Die Rosse des Diomedes', text: 'Dips mit 50 % Körpergewicht als Zusatz, 6 Wiederholungen' },
  { id: 'girdle', name: 'Der Gürtel der Hippolyte', text: 'Taille höchstens 45 % der Körpergrösse' },
  { id: 'cattle', name: 'Die Rinder des Geryon', text: 'Schulterumfang 1.618 × Taille, der goldene Schnitt' },
  { id: 'apples', name: 'Die Äpfel der Hesperiden', text: 'Körperfett 12 % oder weniger' },
  { id: 'cerberus', name: 'Kerberos', text: 'Das ganze Programm abgeschlossen' },
];
export const LABOUR_XP = 2000;

// Masse für die griechische Figur
export const MEASURES = [
  { k: 'waist', label: 'Taille', hint: 'Auf Nabelhöhe. Normal ausatmen, Bauch nicht einziehen.' },
  { k: 'shoulders', label: 'Schulterumfang', hint: 'Arme hängen locker. Rundherum über die breiteste Stelle der Schultern und die obere Brust. Am besten mit Hilfe.' },
  { k: 'chest', label: 'Brust', hint: 'Unter den Achseln durch, vorne auf Höhe der Brustwarzen. Arme hängen, normal ausatmen.' },
  { k: 'arm', label: 'Oberarm', hint: 'Faust machen, Bizeps voll anspannen. Dickste Stelle, Band quer zum Arm.' },
  { k: 'forearm', label: 'Unterarm', hint: 'Arm gestreckt, Faust fest. Dickste Stelle knapp unter dem Ellbogen.' },
  { k: 'neck', label: 'Nacken', hint: 'Direkt unter dem Kehlkopf, Band vorne leicht nach unten geneigt. Blick geradeaus.' },
  { k: 'thigh', label: 'Oberschenkel', hint: 'Stehend, Gewicht auf beiden Beinen. Dickste Stelle direkt unter dem Gesäss.' },
];

// Wochenvolumen: Zielbereich harte Sätze pro Woche (Agon Plus, ohne Waden)
export const MUSCLES = [
  { k: 'side_delt', label: 'Seitliche Schulter', lo: 12, hi: 16 },
  { k: 'chest', label: 'Brust, vor allem obere', lo: 10, hi: 14 },
  { k: 'lats', label: 'Lat, Rückenbreite', lo: 10, hi: 14 },
  { k: 'upper_back', label: 'Hintere Schulter, oberer Rücken', lo: 8, hi: 12 },
  { k: 'biceps', label: 'Bizeps', lo: 6, hi: 10 },
  { k: 'triceps', label: 'Trizeps', lo: 6, hi: 10 },
  { k: 'quads', label: 'Oberschenkel vorne', lo: 6, hi: 10 },
  { k: 'hams', label: 'Oberschenkel hinten, Gesäss', lo: 6, hi: 10 },
  { k: 'abs', label: 'Bauch, Rumpf', lo: 8, hi: 12 },
  { k: 'neck', label: 'Nacken, Trapez', lo: 8, hi: 12 },
  { k: 'forearms', label: 'Unterarm, Griff', lo: 2, hi: 8 },
];
// Anteil pro Satz: 1 = direkt, 0.5 = mittrainiert
export const EX_MUSCLES = {
  inc_bb_press: { chest: 1, triceps: 0.5 }, inc_db_press: { chest: 1, triceps: 0.5 }, flat_bb_bench: { chest: 1, triceps: 0.5 },
  flat_db_press: { chest: 1, triceps: 0.5 }, machine_press: { chest: 1, triceps: 0.5 }, weighted_dip: { chest: 1, triceps: 0.5 },
  close_grip_bench: { triceps: 1, chest: 0.5 }, cable_crossover: { chest: 1 }, cable_fly_low: { chest: 1 },
  standing_press: { side_delt: 0.5, triceps: 0.5 }, arnold: { side_delt: 0.5, triceps: 0.5 },
  lateral_raise: { side_delt: 1 }, cable_lateral: { side_delt: 1 }, db_upright_row: { side_delt: 1, neck: 0.5 },
  face_pull: { upper_back: 1 }, seated_rev_fly: { upper_back: 1 }, machine_rear_delt: { upper_back: 1 },
  weighted_chinup: { lats: 1, biceps: 0.5 }, weighted_cg_chinup: { lats: 1, biceps: 0.5 }, weighted_pullup: { lats: 1, upper_back: 0.5 },
  lat_pulldown: { lats: 1, biceps: 0.5 }, straight_arm_pulldown: { lats: 1 }, cable_row: { upper_back: 1, lats: 0.5 }, machine_row: { upper_back: 1, lats: 0.5 },
  rope_pushdown: { triceps: 1 }, oh_tri_ext_1arm: { triceps: 1 }, db_oh_tri_ext: { triceps: 1 }, rope_oh_ext: { triceps: 1 }, skull_crusher: { triceps: 1 },
  inc_hammer_curl: { biceps: 1, forearms: 0.5 }, standing_hammer: { biceps: 1, forearms: 0.5 }, seated_hammer: { biceps: 1, forearms: 0.5 },
  inc_db_curl: { biceps: 1 }, machine_curl: { biceps: 1 }, cable_rope_curl: { biceps: 1, forearms: 0.5 }, bb_curl: { biceps: 1 },
  bulgarian: { quads: 1, hams: 0.5 }, box_squat: { quads: 1, hams: 0.5 }, squat: { quads: 1, hams: 0.5 }, front_squat: { quads: 1 },
  walking_lunge: { quads: 1, hams: 0.5 }, pistol: { quads: 1 },
  db_rdl: { hams: 1 }, sl_rdl: { hams: 1 }, hip_thrust: { hams: 1 }, sumo_dl: { hams: 1, quads: 0.5, upper_back: 0.5 },
  hanging_knee_raise: { abs: 1 }, side_knee_up: { abs: 1 }, cable_crunch: { abs: 1 }, pallof: { abs: 1 }, side_plank: { abs: 1 },
  shrug: { neck: 1 }, cable_shrug: { neck: 1 }, lean_shrug: { neck: 1 }, neck_ext: { neck: 1 }, neck_curl: { neck: 1 },
  farmer_walk: { forearms: 1, neck: 0.5 },
};

export const LEVEL_NAMES = ['Gut', 'Stark', 'Göttlich'];
export const LEVEL_XP = [300, 600, 1000];

export const KEY_LIFTS = ['inc_bb_press', 'standing_press', 'weighted_chinup', 'weighted_dip', 'inc_db_press', 'weighted_pullup', 'sumo_dl', 'box_squat'];

export const EQ = {
  bb: { inc: 2.5, round: 2.5, label: 'Langhantel' },
  db: { inc: 2, round: 1, label: 'Kurzhantel, pro Hand' },
  wbw: { inc: 1.25, round: 1.25, label: 'Zusatzgewicht' },
  bw: { inc: 1, round: 1, label: 'Körpergewicht, Zusatzlast optional' },
  cable: { inc: 2.5, round: 1.25, label: 'Kabelzug' },
  machine: { inc: 2.5, round: 1.25, label: 'Maschine' },
  plate: { inc: 1.25, round: 1.25, label: 'Hantelscheibe' },
  none: { inc: 0, round: 1, label: 'ohne Gewicht' },
};
export const KINO_STEP = { bb: 10, db: 2, cable: 5, machine: 5, plate: 2.5, wbw: 5, bw: 0, none: 0 };
