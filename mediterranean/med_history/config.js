var config = {
    style: 'mapbox://styles/mapbox/light-v11',
    accessToken: 'pk.eyJ1IjoidHJpbGlraXMiLCJhIjoiY2xiNm9mNThtMDJ6bTNxbnFzenE1MzRjdyJ9.6Pl2-MNJKgmQQwtu7dnKVA',
    showMarkers: true,
    markerColor: 'red',
    // projection: 'equirectangular',
    //Read more about available projections here
    //https://docs.mapbox.com/mapbox-gl-js/example/projections/
    inset: true,
    theme: 'light',
    use3dTerrain: false, //set true for enabling 3D maps.
    auto: false,
    title: '',
    subtitle: '',
    byline: '',
    footer: '',
    chapters: [
        {
            id: 'slug-style-id',
            alignment: 'fully',
            hidden: false,
            title: 'When hellenism and zionism aspired to become nation states',
            image: '',
            description: 'As empires collapsed, two ethnic ideologies searched for a nation state',
            showMarkers: false,
            location: {
                center: [33, 36],
                zoom: 5.4,
                pitch: 20,
                bearing: 10
            },
            mapAnimation: 'flyTo',
            rotateAnimation: false,
            callback: '',
            onChapterEnter: [
                // {
                //     layer: 'layer-name',
                //     opacity: 1,
                //     duration: 5000
                // }
            ],
            onChapterExit: [
                // {
                //     layer: 'layer-name',
                //     opacity: 0
                // }
            ]
        },
        {
            id: 'second-identifier',
            alignment: 'right',
            hidden: false,
            title: '',
            image: './images/Richard_Church.png',
            description: 'In downtown Athens and Tel Aviv, many streets bear the names of British benefactors, recognizing the role they played in creating the Greek and Israeli states.Close to Athens’ Omonia Square, little-known Kaningos Square leads into two-block Tzortz Street. Though the names date from the creation of Greece in 1832, they reference a British foreign minister and an Irish mercenary. George Canning offered diplomatic and financial cover to Greek revolutionaries against the Ottoman Empire while dispatching Richard Church to shape an army out of disparate and often clashing rebel groups. Greek gratitude to Britain extends beyond its formative years. Piraeus’ main Korai Square was named after British Prime Minister Winston Churchill for a decade, in recognition of his role in keeping Greece non-Communist in 1944.',
            location: {
                center: [33.5254, 44.6166],
                zoom: 7.5,
                pitch: 0,
                bearing: 0,
                // flyTo additional controls-
                // These options control the flight curve, making it move
                // slowly and zoom out almost completely before starting
                // to pan.
                speed: 1, // make the flying slow
                curve: 1, // change the speed at which it zooms out
            },
            mapAnimation: 'flyTo',
            rotateAnimation: true,
            callback: '',
            onChapterEnter: [],
            onChapterExit: []
        },
        {
            id: 'third-identifier',
            alignment: 'left',
            hidden: false,
            title: '',
            image: '',
            description: 'In Tel Aviv’s downtown, yet more streets are named after British figures instrumental in Israel’s creation. Rothschild Boulevard is dedicated to Lord Walter Rothschild, a British Jewish community leader who received the seminal 1917 Balfour Declaration promising a Jewish homeland in Palestine during the reign of George V, after whom another street is named. Allenby Street references the general who took Jerusalem from the Ottomans in 1917, then informed his Arab allies who had just driven the Turks from Damascus that Britain intended to create a Jewish state in Palestine, cancelling the pan-Arab state London had promised them.',
            location: {
                center: [30.7233, 46.4825],
                zoom: 8.52,
                pitch: 0,
                bearing: 0,
                speed: 2, // make the flying slow
                curve: 1, // change the speed at which it zooms out
            },
            mapAnimation: 'flyTo',
            rotateAnimation: true,
            callback: '',
            onChapterEnter: [],
            onChapterExit: []
        },
        {
            id: 'fourth-chapter',
            alignment: 'right',
            hidden: false,
            title: '',
            image: '',
            description: 'The naming of streets in Athens and Tel Aviv after prominent Britons reveals to what extent the Greek and Israeli states are indebted to Britain for their existence. But why was it a diplomatic, military and financial priority for London to ensure that these two countries be created within just over a century of each other in the East Mediterranean? To what extent were they intended to confront Russian ambitions in the Mediterranean? And why should we care about events that happened up to two hundred years ago, in what appears a distant past?',
            location: {
                center: [28.9784, 41.0082],
                zoom: 8.5,
                pitch: 0,
                bearing: 0,
                speed: 2, // make the flying slow
                curve: 1, // change the speed at which it zooms out
            },
            mapAnimation: 'flyTo',
            rotateAnimation: true,
            callback: '',
            onChapterEnter: [],
            onChapterExit: []
        },
        {
            id: 'fifth-chapter',
            alignment: 'left',
            hidden: false,
            title: 'Navarino',
            image: '',
            description: 'It matters because the same geopolitical rivalries that prompted Britain to midwife two Mediterranean nations are now repeating across the same geographies that kindled centuries of clashes and a world war. With 2022 and 2023 being the most conflictual years since the end of the Cold War, and 2022’s $2 trillion global military expenditure the highest too, these antagonisms may already have brought us to the verge of global conflict, albeit one currently restricted to two fronts. Additional tensions arise from the efforts of Global South actors to extricate themselves from an indebted and over-financialized Western economic system that never resolved the causes of its 2008 economic crisis, but weaponized its financial network against geopolitical rivals. ',
            location: {
                center: [21.6963, 36.9131],
                zoom: 8.5,
                pitch: 0,
                bearing: 0,
                speed: 2, // make the flying slow
                curve: 1, // change the speed at which it zooms out
            },
            mapAnimation: 'flyTo',
            rotateAnimation: true,
            callback: '',
            onChapterEnter: [],
            onChapterExit: []
        },
        {
            id: 'sixth-chapter',
            alignment: 'right',
            hidden: false,
            title: '',
            image: '',
            description: 'Western policymakers increasingly treat China’s Belt and Road (BRI) trade alternative – partly crossing the same geography over which Persian, Arab, Ottoman, Venetian, Portuguese and Dutch navies have fought for centuries – as a threat. Proof of the permanence of geography lies in the traces of the precursors to the Suez Canal, the jugular vein of world trade, etched into the Egyptian desert. These pre-modern waterways funnelled trade from the Red Sea to the Mediterranean as early as 3,600 years before the contemporary Suez Canal opened. They were constructed by two pharaohs and a Persian king, maintained by the Ptolemies and Roman emperors, before an Abbasid caliph closed and French engineers reopened them.',
            location: {
                center: [23.6539, 37.9475],
                zoom: 6,
                pitch: 0,
                bearing: 0,
                speed: 2, // make the flying slow
                curve: 1, // change the speed at which it zooms out
            },
            mapAnimation: 'flyTo',
            rotateAnimation: true,
            callback: '',
            onChapterEnter: [],
            onChapterExit: []
        },
        {
            id: 'seventh-chapter',
            alignment: 'left',
            hidden: false,
            title: '',
            image: '',
            description: 'The cracks reappearing in the global economic Pax Americana are nowhere more visible than in the naval thoroughfares kept docile by the consecutive Pax Romana, Ottomana, Britanica and Americana. The conflicts in Ukraine and Gaza are manifestations of both local antagonisms but also a global power recalibration. By early October this year, the February 2022 Russian invasion of Ukraine had settled into a quagmire. When Hamas militants stunned Israel by executing an October 7 military operation taking two hundred hostages, international tensions shifted from the Black Sea to coalesce in the eastern Mediterranean waters lapping the Gazan coastline. The US reoriented its military from Kiev to Tel Aviv. While both conflicts are largely landbound, considerable naval buildups risk escalating at sea. The real stakes remain maritime and related to the chokepoints holding this geography’s strategic value: the North-to-South axis beginning in the Sea of Azov and running through the Dardanelles and Aegean to the Red Sea, past war-torn Port Sudan and into the Arabian Sea, just off a Yemeni coast currently haunted by Houthi helicopters.',
            location: {
                center: [35.2137, 31.7683],
                zoom: 6,
                pitch: 0,
                bearing: 0,
                speed: 2, // make the flying slow
                curve: 1, // change the speed at which it zooms out
            },
            mapAnimation: 'flyTo',
            rotateAnimation: true,
            callback: '',
            onChapterEnter: [],
            onChapterExit: []
        },
        {
            id: 'eighth-chapter',
            alignment: 'right',
            hidden: false,
            title: '',
            image: '',
            description: 'This critical vertical trade artery has offered many casi belli since the Ottomans scrapped with the Portuguese over their spice trade monopoly in the 16th century and with the Russians over control of the European river trade in the 18th. Way before the Suez Canal came into being in 1869, the British knew they could only keep Russia out of the Mediterranean if they controlled the Bosporus chokepoint or the Aegean Sea leading to it. So when the Greek rebellion of 1821 erupted, it seemed like an opportunity for London to cement its influence, despite having just acquired the Ionian islands and being bound by an anti-revolutionary, post-Napoleonic Wars status quo solidly in support of the Ottoman Empire as a wedge against Russian influence among Orthodox Balkan populations.',
            location: {
                center: [32.5263, 29.9737],
                zoom: 6,
                pitch: 0,
                bearing: 0,
                speed: 2, // make the flying slow
                curve: 1, // change the speed at which it zooms out
            },
            mapAnimation: 'flyTo',
            rotateAnimation: true,
            callback: '',
            onChapterEnter: [],
            onChapterExit: []
        },
        {
            id: 'ninth-chapter',
            alignment: 'left',
            hidden: false,
            title: 'Abou Kir, Navarino and Crimea ',
            image: '',
            description: 'Britain’s 150 years of Mediterranean dominance dawned with the crushing of a Napoleonic fleet at the seabattle of Aboukir in 1798. Its navy ensured that Russian and Austro-Hungarian access to the Great Sea be limited. In 1869, the vision of a marginal Briton was realised and the Suez Canal opened, nearly halving the distance to Britain’s most lucrative colony, India. This set London on collision course with a Russia that set foot on the Black Sea in 1783 – an Ottoman lake since the late 15th century – by wresting the Crimea (and other territories which either remain part of or are claimed by Ukraine today) from the Sultan. Moscow already had access to the Mediterranean through the 1774 Kuchuk Kainarji treaty, which allowed Russian merchant ships to transit the Bosphorus and Dardanelles. After founding its first warm-water ports in Sevastopol and Odessa, Moscow next wanted to control Istanbul because, aside from being the world’s capital, as Napoleon Bonaparte quipped, its location controlled the only possible Russian exit onto the Mediterranean. Catherine the Great’s Greek Plan intended to divide the Ottoman Empire between Russia and Austro-Hungary, with Istanbul becoming the capital of a revived Byzantium. Judging Russia’s expansion to be detrimental to its interests, Britain switched sides and allied itself with the Ottomans, going to war in 1853 in the Crimean. Russia’s defeat resulted in the Black Sea being declared neutral, but by the start of the First World War it was again on the brink of seizing Istanbul (or Tsargrad, as it liked to call it). The Eastern Question - who would dominate the lands of the Ottoman Empire after it collapsed? - not only loomed heavier than ever, but was the main unappreciated reason why World War One was fought. Britain gained a valuable Mediterranean foothold in 1878 by taking control of Cyprus',
            location: {
                center: [33.4299, 35.1264],
                zoom: 7,
                pitch: 0,
                bearing: 0,
                speed: 2, // make the flying slow
                curve: 1, // change the speed at which it zooms out
            },
            mapAnimation: 'flyTo',
            rotateAnimation: true,
            callback: '',
            onChapterEnter: [],
            onChapterExit: []
        },
        {
            id: 'tenth-chapter',
            alignment: 'right',
            hidden: false,
            title: '',
            image: '',
            description: 'Even though the colonial era was at its peak, the Greek Revolution and Zionist calls to settle Palestine popularized the liberal idea that some peoples had a right to self-determination. The Russian-founded, cosmopolitan Black Sea port of Odessa was a beehive of proto-nationalist activity and saw the founding, in the 19th century, of both the Filiki Eteria and the Jewish Self-Defence Organization, alongside the composition of Auto-Emancipation, a founding document of modern Jewish nationalism. The Russians and French aspired to protect the Ottomans’ Orthodox and Catholic Christians, respectively. But with no significant Protestant Christian community in the Eastern Mediterranean, Britain struggled to acquire influence. Some policymakers identified its influential Jewish community as reason enough to consider sponsoring a Jewish homeland. Though Napoleon had already beaten the British to the promise upon taking of Gaza in 1798, it was the British who would realise it. Scene of Ottoman Empire’s greatest naval victory against a Holy League fleet in 1538, but also a 1911 defeat during the Italo-Turkish War ',
            location: {
                center: [20.75, 38.95],
                zoom: 6,
                pitch: 0,
                bearing: 0,
                speed: 2, // make the flying slow
                curve: 1, // change the speed at which it zooms out
            },
            mapAnimation: 'flyTo',
            rotateAnimation: true,
            callback: '',
            onChapterEnter: [],
            onChapterExit: []
        },
        {
            id: 'eleventh-chapter',
            alignment: 'left',
            hidden: false,
            title: '',
            image: '',
            description: 'From the 18th century onwards, Russia invested heavily in carving out influence in the Mediterranean in search of an anchorage by financing Orthodox ecclesiastical establishments and pilgrimages to Mount Athos and the Holy Land. Partially to counter Russia, the British established a consulate in Jerusalem in 1838. The second consul, James Finn, established the Palestine Exploration Fund, which conducted archaeological digs alongside intelligence activity. Russia established its own Imperial Orthodox Palestine Society in 1882 and sponsored so many of its devout to worship in Jerusalem that at Easter 1911 one in three people in the holy city was a Russian pilgrim. British consuls were generally supportive of Jewish immigration and in 1920 the British appointed Herbert Samuel, a Zionist and the first Jew to head a British political party, High Commissioner for Palestine.',
            location: {
                center: [29.9553, 31.2156],
                zoom: 4,
                pitch: 0,
                bearing: 0,
                speed: 2, // make the flying slow
                curve: 1, // change the speed at which it zooms out
            },
            mapAnimation: 'flyTo',
            rotateAnimation: true,
            callback: '',
            onChapterEnter: [],
            onChapterExit: []
        },
        {
            id: 'twelveth-chapter',
            alignment: 'right',
            hidden: false,
            title: '',
            image: '',
            description: "The urgency of keeping Russia out of the Mediterranean in the 1820s focused Britain on Greece, whose geography and extensive Mediterranean coastline were tempting to the powers. But it was Russia, even more than Britain, which acted on behalf of Greek independence. Prominent Greek revolutionaries Alexandros Ypsilantis and Ioannis Kapodistrias and members of the secret society that launched the revolution were high-ranking officers in the Czar’s administration. It was Russian intel that the Ottomans were planning to swap the rebelled native Christian populace in the Peloponnese with Egyptian Muslim settlers brought in by Egypt’s Ibrahim Pasha (the so-called “barbarization project”) that prompted joint British-Russian action. The 1826 St Petersburg Protocol saw London and Moscow agree not to seek exclusive territorial gains in Greece nor “exclusive” political and economic influence, and paved the way for the Battle of Navarino in 1827. But even after that, the plan was for Greece to be only semi-autonomous within an Ottoman imperial context. What finalized Greek independence was “not the plots and rebellions of Ali Pasha of Janina, not the battle of Navarino, not the French army in the Morea, not the conferences and protocols of London, but the march of Diebitsch's Russians across the Balkan into the valley of the Maritza (Evros)”, Karl Marx argued in 1853 in the New York Tribune.",
            location: {
                center: [29.9553, 31.2156],
                zoom: 4,
                pitch: 0,
                bearing: 0,
                speed: 1, // make the flying slow
                curve: 1, // change the speed at which it zooms out
            },
            mapAnimation: 'flyTo',
            rotateAnimation: true,
            callback: '',
            onChapterEnter: [],
            onChapterExit: []
        }
    ]
};
