var config = {
    style: 'mapbox://styles/trilikis/clsbsxt0301k901pe4k7y0hsx',
    accessToken: 'pk.eyJ1IjoidHJpbGlraXMiLCJhIjoiY2xiNm9mNThtMDJ6bTNxbnFzenE1MzRjdyJ9.6Pl2-MNJKgmQQwtu7dnKVA',
    showMarkers: false,
    markerColor: 'black',
    layerTypes:'circle',
    // projection: 'equirectangular',
    //Read more about available projections here
    //https://docs.mapbox.com/mapbox-gl-js/example/projections/
    inset: false,
    theme: 'light',
    use3dTerrain: false, //set true for enabling 3D maps.
    auto: false,
    title: '',
    subtitle: '',
    byline: '',
    footer: '',
    chapters: [
        {
            id: 'entry-title',
            alignment: 'left',
            hidden: false,
            title: 'When Hellenism and Zionism aspired to nation-statehood ',
            image: '',
            description: '<span class="subtitle"> As empires collapsed, two ethnic ideologies sought a nation-state.</class> <br><br><a href="https://lab.imedd.org/en/lab-author/iason-athanasiadis/" span class="author">By Iason Athanasiadis</span></a><br><a href="https://lab.imedd.org/en/lab-author/thanasis-troboukis-en/" span class="author">Visualization by Thanasis Troboukis</span></a>',
            showMarkers: false,
            location: {
                center: [23.8243, 37.074],
                zoom: 4.2,
                pitch: 0,
                bearing: 10
            },
            mapAnimation: 'flyTo',
            rotateAnimation: false,
            callback: '',
            onChapterEnter: [
                {
                    layer: 'ottoman-geojson-6qspft',
                    opacity: 1,
                    duration: 500
                },
                {
                    layer: 'greece-israel',
                    opacity: 0
                },
                {
                    layer: 'ukraine-gaza-red-sea',
                    opacity: 0
                },
                {
                    layer: 'suez',
                    opacity: 0
                },
                {
                    layer: 'three-seas',
                    opacity: 0
                },
                {
                    layer: 'three-seas (1)',
                    opacity: 0
                },
                {
                    layer: 'ukraine-gaza-red-sea (1)',
                    opacity:0
                },
                {
                    layer: 'sevastopol-odessa-istanbul (1)',
                    opacity: 0
                },
                {
                    layer: 'sevastopol-odessa-istanbul',
                    opacity: 0
                },
                {
                    layer: 'egypt',
                    opacity: 0
                },
                {
                    layer: 'greece',
                    opacity: 0
                },
                {
                    layer: 'bosporos',
                    opacity: 0
                },
                {
                    layer: 'bosporos (1)',
                    opacity: 0
                },
                {
                    layer: 'turkey',
                    opacity: 0
                },
                {
                    layer: 'george-double',
                    opacity: 0
                },
                {
                    layer: 'george-double (1)',
                    opacity: 0
                },
                {
                    layer: 'tel-aviv',
                    opacity: 0
                },
                {
                    layer: 'tel-aviv (1)',
                    opacity: 0
                }
            ],
            onChapterExit: [
                {
                    layer: 'ottoman-geojson-6qspft',
                    opacity: 0
                }
            ]
        },
        {
            id: 'second-identifier',
            alignment: 'right',
            hidden: false,
            title: '',
            image: './images/Richard_Church.png',
            caption: 'The British officer Richard Church, painted by Spyridon Prosalentis wearing the uniform of a Greek general. Church was the commander-in-chief of the Greek land forces during the final stages of the Greek War of Independence.',
            description: '<span class="drop_cap">C</span>lose to Athens’ Omonia Square, little-known Kaningos Square leads into two-block Tzortz Street. Though the names date from the creation of Greece in 1832, they reference a British foreign minister and an Irish mercenary. George Canning offered diplomatic and financial cover to Greek revolutionaries against the Ottoman Empire while dispatching Richard Church to shape an army out of disparate and often clashing rebel groups. Greek gratitude to Britain extends beyond its formative years. Piraeus’ main Korai Square was named after British Prime Minister Winston Churchill for a decade, in recognition of his role in keeping Greece non-Communist in 1944.<hr>',
            location: {
                center: [23.735, 37.985],
                zoom: 15.5,
                pitch: 0,
                bearing: 0,
                // flyTo additional controls-
                // These options control the flight curve, making it move
                // slowly and zoom out almost completely before starting
                // to pan.
                speed: .9, // make the flying slow
                curve: .9, // change the speed at which it zooms out
            },
            mapAnimation: 'flyTo',
            rotateAnimation: false,
            callback: '',
            onChapterEnter: [
                {
                    layer: 'george-double',
                    opacity: 1,
                    duration: 50
                },
                {
                    layer: 'george-double (1)',
                    opacity: 1,
                    duration: 50
                },
                {
                    layer: 'ottoman-geojson-6qspft',
                    opacity: 0,
                    duration: 500
                },
                {
                    layer: 'greece-israel',
                    opacity: 0
                },
                {
                    layer: 'ukraine-gaza-red-sea',
                    opacity: 0
                },
                {
                    layer: 'suez',
                    opacity: 0
                },
                {
                    layer: 'three-seas',
                    opacity: 0
                },
                {
                    layer: 'three-seas (1)',
                    opacity: 0
                },
                {
                    layer: 'ukraine-gaza-red-sea (1)',
                    opacity:0
                },
                {
                    layer: 'sevastopol-odessa-istanbul (1)',
                    opacity: 0
                },
                {
                    layer: 'sevastopol-odessa-istanbul',
                    opacity: 0
                },
                {
                    layer: 'egypt',
                    opacity: 0
                },
                {
                    layer: 'greece',
                    opacity: 0
                },
                {
                    layer: 'bosporos',
                    opacity: 0
                },
                {
                    layer: 'bosporos (1)',
                    opacity: 0
                },
                {
                    layer: 'turkey',
                    opacity: 0
                },
                {
                    layer: 'tel-aviv',
                    opacity: 0
                },
                {
                    layer: 'tel-aviv (1)',
                    opacity: 0
                }
            ],
            onChapterExit: [
                {
                    layer: 'george-double',
                    opacity: 0
                },
                {
                    layer: 'george-double (1)',
                    opacity: 0
                }
            ]
        },
        {
            id: 'third-identifier',
            alignment: 'left',
            hidden: false,
            title: '',
            image: './images/440px-Edmund_Allenby.png',
            caption: "General Edmund Allenby was a British army officer and imperial governor whose forces captured the Ottoman province of Palestine",
            description: "In Tel Aviv’s downtown, yet more streets are named after British figures instrumental in Israel’s creation. Rothschild Boulevard is dedicated to Lord Walter Rothschild, a British Jewish banker and community leader who received the seminal 1917 Balfour Declaration promising a Jewish homeland in Palestine during the reign of George V, after whom another street is named. Allenby Street references the general who took Jerusalem from the Ottomans in 1917, then informed his Arab allies who had just driven the Turks from Damascus that Britain intended to create a Jewish state in Palestine, annulling the pan-Arab state London had promised them.<hr>",
            location: {
                center: [34.765, 32.07],
                zoom: 14,
                pitch: 0,
                bearing: 0,
                speed: .9, // make the flying slow
                curve: .9, // change the speed at which it zooms out
            },
            mapAnimation: 'flyTo',
            rotateAnimation: false,
            callback: '',
            onChapterEnter: [{
                layer: 'tel-aviv',
                opacity: 1,
                duration: 5000
            },
            {
                layer: 'tel-aviv (1)',
                opacity: 1,
                duration: 5000
            },
            {
                layer: 'ottoman-geojson-6qspft',
                opacity: 0,
                duration: 500
            },
            {
                layer: 'greece-israel',
                opacity: 0
            },
            {
                layer: 'ukraine-gaza-red-sea',
                opacity: 0
            },
            {
                layer: 'suez',
                opacity: 0
            },
            {
                layer: 'three-seas',
                opacity: 0
            },
            {
                layer: 'three-seas (1)',
                opacity: 0
            },
            {
                layer: 'ukraine-gaza-red-sea (1)',
                opacity:0
            },
            {
                layer: 'sevastopol-odessa-istanbul (1)',
                opacity: 0
            },
            {
                layer: 'sevastopol-odessa-istanbul',
                opacity: 0
            },
            {
                layer: 'egypt',
                opacity: 0
            },
            {
                layer: 'greece',
                opacity: 0
            },
            {
                layer: 'bosporos',
                opacity: 0
            },
            {
                layer: 'bosporos (1)',
                opacity: 0
            },
            {
                layer: 'turkey',
                opacity: 0
            }
            ],
            onChapterExit: [{
                layer: 'tel-aviv',
                opacity: 0
            },
            {
                layer: 'tel-aviv (1)',
                opacity: 0
            }
            ]
        },
        {
            id: 'fourth-chapter',
            alignment: 'right',
            hidden: false,
            title: '',
            image: '',
            description: 'The naming of streets in Athens and Tel Aviv after prominent Britons reveals to what extent the Greek and Israeli states are indebted to Britain for their existence. But why was it a diplomatic, military and financial priority for London to ensure that these two countries be created within just over a century of each other in the East Mediterranean? To what extent were they intended to confront Russian ambitions in the Mediterranean? And why should we care about events that happened up to two hundred years ago?',
            location: {
                center: [32.048012, 35.553127],
                zoom: 5.0,
                pitch: 0,
                bearing: 0,
                speed: 2, // make the flying slow
                curve: 1, // change the speed at which it zooms out
            },
            mapAnimation: 'flyTo',
            rotateAnimation: false,
            callback: '',
            onChapterEnter: [{
                layer: 'greece-israel',
                opacity: 1,
                duration: 2000
            },
            {
                layer: 'ottoman-geojson-6qspft',
                opacity: 0,
                duration: 500
            },
            {
                layer: 'ukraine-gaza-red-sea',
                opacity: 0
            },
            {
                layer: 'suez',
                opacity: 0
            },
            {
                layer: 'three-seas',
                opacity: 0
            },
            {
                layer: 'three-seas (1)',
                opacity: 0
            },
            {
                layer: 'ukraine-gaza-red-sea (1)',
                opacity:0
            },
            {
                layer: 'sevastopol-odessa-istanbul (1)',
                opacity: 0
            },
            {
                layer: 'sevastopol-odessa-istanbul',
                opacity: 0
            },
            {
                layer: 'egypt',
                opacity: 0
            },
            {
                layer: 'greece',
                opacity: 0
            },
            {
                layer: 'bosporos',
                opacity: 0
            },
            {
                layer: 'bosporos (1)',
                opacity: 0
            },
            {
                layer: 'turkey',
                opacity: 0
            },
            {
                layer: 'george-double',
                opacity: 0
            },
            {
                layer: 'george-double (1)',
                opacity: 0
            },
            {
                layer: 'tel-aviv',
                opacity: 0
            },
            {
                layer: 'tel-aviv (1)',
                opacity: 0
            }
        ],
            onChapterExit: [{
                layer: 'greece-israel',
                opacity: 0,
                duration: 50
            }]
        },
        {
            id: 'fifth-chapter',
            alignment: 'left',
            hidden: false,
            title: '',
            image: '',
            description: 'They matter because the same geopolitical rivalries that prompted Britain to midwife two Mediterranean nations are now repeating across the same geographies that kindled centuries of clashes and a world war. With 2022 and 2023 being the most conflictual years since the end of the Cold War, and 2022’s $2 trillion global military expenditure the highest too, these antagonisms may have already brought us to the verge of a global conflict, currently unfolding on three fronts. Additional tensions arise from the efforts of Global South actors to extricate themselves from an indebted and over-financialized Western economic system that never resolved the causes of its 2008 economic crisis, but weaponized its financial network against geopolitical rivals.',
            location: {
                center: [30.048012, 34.553127],
                zoom: 4.0,
                pitch: 0,
                bearing: 0,
                speed: 2, // make the flying slow
                curve: 1, // change the speed at which it zooms out
            },
            mapAnimation: 'flyTo',
            rotateAnimation: false,
            callback: '',
            onChapterEnter: [{
                layer: 'ukraine-gaza-red-sea',
                opacity: 1,
                duration: 500
            },
            {
                layer: 'ukraine-gaza-red-sea (1)',
                opacity:1,
                duration: 500
            },
            ,
            {
                layer: 'ottoman-geojson-6qspft',
                opacity: 0,
                duration: 500
            },
            {
                layer: 'greece-israel',
                opacity: 0
            },
            {
                layer: 'suez',
                opacity: 0
            },
            {
                layer: 'three-seas',
                opacity: 0
            },
            {
                layer: 'three-seas (1)',
                opacity: 0
            },
            {
                layer: 'sevastopol-odessa-istanbul (1)',
                opacity: 0
            },
            {
                layer: 'sevastopol-odessa-istanbul',
                opacity: 0
            },
            {
                layer: 'egypt',
                opacity: 0
            },
            {
                layer: 'greece',
                opacity: 0
            },
            {
                layer: 'bosporos',
                opacity: 0
            },
            {
                layer: 'bosporos (1)',
                opacity: 0
            },
            {
                layer: 'turkey',
                opacity: 0
            },
            {
                layer: 'george-double',
                opacity: 0
            },
            {
                layer: 'george-double (1)',
                opacity: 0
            },
            {
                layer: 'tel-aviv',
                opacity: 0
            },
            {
                layer: 'tel-aviv (1)',
                opacity: 0
            }
        ],
            onChapterExit: [{
                layer: 'ukraine-gaza-red-sea',
                opacity: 0,
                duration: 50
            },
            {
                layer: 'ukraine-gaza-red-sea (1)',
                opacity:0,
                duration: 500
            }]
        },
        {
            id: 'sixth-chapter',
            alignment: 'right',
            hidden: false,
            title: '',
            image: '',
            caption: '',
            description: 'Western policymakers increasingly treat as a threat China’s Belt and Road Initiative (BRI), a trade alternative that partly crosses the same geography over which Persian, Arab, Ottoman, Venetian, Portuguese and Dutch navies fought for centuries. Proof of the permanence of geography lies in the traces of the precursors to the jugular vein of world trade, the Suez Canal, which still remain etched into the Egyptian desert. These pre-modern waterways were carved out by thousands of hands as early as 3,600 years before the contemporary Suez Canal opened, so that trade could be funneled from the Red Sea to the Mediterranean. They were constructed by two pharaohs and a Persian king, maintained by the Ptolemies and Roman emperors, before an Abbasid caliph closed, and French engineers reopened them.',
            location: {
                center: [32.5263, 29.9737],
                zoom: 6,
                pitch: 0,
                bearing: 0,
                speed: 2, // make the flying slow
                curve: 1, // change the speed at which it zooms out
            },
            mapAnimation: 'flyTo',
            rotateAnimation: false,
            callback: '',
            onChapterEnter: [{
                layer: 'suez',
                opacity: 1,
                duration: 500
            },
            {
                layer: 'ottoman-geojson-6qspft',
                opacity: 0,
                duration: 500
            },
            {
                layer: 'greece-israel',
                opacity: 0
            },
            {
                layer: 'ukraine-gaza-red-sea',
                opacity: 0
            },
            {
                layer: 'three-seas',
                opacity: 0
            },
            {
                layer: 'three-seas (1)',
                opacity: 0
            },
            {
                layer: 'ukraine-gaza-red-sea (1)',
                opacity:0
            },
            {
                layer: 'sevastopol-odessa-istanbul (1)',
                opacity: 0
            },
            {
                layer: 'sevastopol-odessa-istanbul',
                opacity: 0
            },
            {
                layer: 'egypt',
                opacity: 0
            },
            {
                layer: 'greece',
                opacity: 0
            },
            {
                layer: 'bosporos',
                opacity: 0
            },
            {
                layer: 'bosporos (1)',
                opacity: 0
            },
            {
                layer: 'turkey',
                opacity: 0
            },
            {
                layer: 'george-double',
                opacity: 0
            },
            {
                layer: 'george-double (1)',
                opacity: 0
            },
            {
                layer: 'tel-aviv',
                opacity: 0
            },
            {
                layer: 'tel-aviv (1)',
                opacity: 0
            }
        ],
            onChapterExit: [{
                layer: 'suez',
                opacity: 0,
                duration: 50
            }]
        },
        {
            id: 'seventh-chapter',
            alignment: 'left',
            hidden: false,
            title: '',
            image: '',
            description: 'The cracks reappearing in the global system are nowhere more visible than in the naval thoroughfares kept docile by the consecutive Pax Romana, Ottomana, Britanica and Americana. The conflicts in Ukraine and Gaza are manifestations of both local antagonisms but also a global power recalibration. By 2023, the February 2022 Russian invasion of Ukraine had settled into a quagmire. When Hamas militants stunned Israel by executing an October 7 military operation that resulted in the largest death-toll in Israel’s history and their taking of two hundred hostages, international tensions coalesced from the Black Sea to the eastern Mediterranean waters lapping the Gazan coastline. The US reoriented its military from Kiev to Tel Aviv. While both conflicts are largely landbound, considerable naval buildups at sea increase the risk of escalation. Besides, the real stakes remain maritime as they relate to the chokepoints holding this geography’s strategic value: the North-South axis beginning in the Sea of Azov and running through the Dardanelles and Aegean to the Red Sea, past war-torn Port Sudan and into the Arabian Sea, just off a Yemeni coast currently haunted by Houthi missiles and drones.',
            location: {
                center: [36.3013, 25.0482],
                zoom: 4,
                pitch: 0,
                bearing: 0,
                speed: 2, // make the flying slow
                curve: 1, // change the speed at which it zooms out
            },
            mapAnimation: 'flyTo',
            rotateAnimation: false,
            callback: '',
            onChapterEnter: [
                {
                    layer: 'three-seas',
                    opacity: 1,
                    duration: 500
                },
                {
                    layer: 'three-seas (1)',
                    opacity: 1,
                    duration: 500
                },
                {
                    layer: 'ottoman-geojson-6qspft',
                    opacity: 0,
                    duration: 500
                },
                {
                    layer: 'greece-israel',
                    opacity: 0
                },
                {
                    layer: 'ukraine-gaza-red-sea',
                    opacity: 0
                },
                {
                    layer: 'suez',
                    opacity: 0
                },
                {
                    layer: 'ukraine-gaza-red-sea (1)',
                    opacity:0
                },
                {
                    layer: 'sevastopol-odessa-istanbul (1)',
                    opacity: 0
                },
                {
                    layer: 'sevastopol-odessa-istanbul',
                    opacity: 0
                },
                {
                    layer: 'egypt',
                    opacity: 0
                },
                {
                    layer: 'greece',
                    opacity: 0
                },
                {
                    layer: 'bosporos',
                    opacity: 0
                },
                {
                    layer: 'bosporos (1)',
                    opacity: 0
                },
                {
                    layer: 'turkey',
                    opacity: 0
                },
                {
                    layer: 'george-double',
                    opacity: 0
                },
                {
                    layer: 'george-double (1)',
                    opacity: 0
                },
                {
                    layer: 'tel-aviv',
                    opacity: 0
                },
                {
                    layer: 'tel-aviv (1)',
                    opacity: 0
                }
            ],
            onChapterExit: []
        },
        {
            id: 'eighth-chapter',
            alignment: 'right',
            hidden: false,
            title: '',
            image: '',
            description: 'This <a href="https://www.youtube.com/watch?v=JKmK_IeXcZU">critical</a> vertical trade artery has offered many casi belli since the Ottomans scrapped with the Portuguese over their spice trade monopoly in the 16th century and with the Russians over control of the European river trade in the 18th. Way before the Suez Canal came into being in 1869, the British knew that the easiest way to keep Russia out of the Mediterranean was by controlling the Bosporus chokepoint, or the Aegean Sea leading to it. So when the Greek rebellion of 1821 erupted, it seemed to London like an opportunity to cement its influence. That London acted to support the Greek revolutionaries was even more startling, since it had  just acquired the Ionian islands, and was bound by an anti-revolutionary, post-Napoleonic Wars status quo in support of the Ottoman Empire as a wedge against Russian influence among Orthodox Balkan populations.',
            location: {
                center: [36.3013, 25.0482],
                zoom: 4,
                pitch: 0,
                bearing: 0,
                speed: 2, // make the flying slow
                curve: 1, // change the speed at which it zooms out
            },
            mapAnimation: 'flyTo',
            rotateAnimation: false,
            callback: '',
            onChapterEnter: [
                {
                layer: 'three-seas',
                opacity: 1,
                duration: 500
            },
            {
                layer: 'three-seas (1)',
                opacity: 1,
                duration: 500
            },
            {
                layer: 'ottoman-geojson-6qspft',
                opacity: 0,
                duration: 500
            },
            {
                layer: 'greece-israel',
                opacity: 0
            },
            {
                layer: 'ukraine-gaza-red-sea',
                opacity: 0
            },
            {
                layer: 'suez',
                opacity: 0
            },
            {
                layer: 'ukraine-gaza-red-sea (1)',
                opacity:0
            },
            {
                layer: 'sevastopol-odessa-istanbul (1)',
                opacity: 0
            },
            {
                layer: 'sevastopol-odessa-istanbul',
                opacity: 0
            },
            {
                layer: 'egypt',
                opacity: 0
            },
            {
                layer: 'greece',
                opacity: 0
            },
            {
                layer: 'bosporos',
                opacity: 0
            },
            {
                layer: 'bosporos (1)',
                opacity: 0
            },
            {
                layer: 'turkey',
                opacity: 0
            },
            {
                layer: 'george-double',
                opacity: 0
            },
            {
                layer: 'george-double (1)',
                opacity: 0
            },
            {
                layer: 'tel-aviv',
                opacity: 0
            },
            {
                layer: 'tel-aviv (1)',
                opacity: 0
            }
        ],
            onChapterExit: []
        },
        {
            id: 'ninth-chapter',
            alignment: 'left',
            hidden: false,
            title: 'Abou Kir, Navarino and Crimea ',
            image: '',
            description: '<img src="./images/The_Battle_of_the_Nile.png"style="width: 100%; vertical-align: middle;"><span class="caption">The naval battle of Aboukir, painted by George Arnald</span> <br><br><span class="drop_cap">B</span>ritain’s 150 years of Mediterranean dominance dawned with the crushing of a Napoleonic fleet at the seabattle of Aboukir in 1798, which empowered its navy to limit Russian and Austro-Hungarian access to the Great Sea. When a marginal Briton’s vision was realised in 1869 and the Suez Canal opened, the distance to Britain’s most lucrative colony, India, was nearly halved. But it also set London on collision course with a Russia eager to expand into the Mediterranean.',
            location: {
                center: [36.3013, 25.0482],
                zoom: 4,
                pitch: 0,
                bearing: 0,
                speed: 2, // make the flying slow
                curve: 1, // change the speed at which it zooms out
            },
            mapAnimation: 'flyTo',
            rotateAnimation: false,
            callback: '',
            onChapterEnter: [{
                layer: 'three-seas',
                opacity: 1,
                duration: 500
            },
            {
                layer: 'three-seas (1)',
                opacity: 1,
                duration: 500
            },
            {
                layer: 'ottoman-geojson-6qspft',
                opacity: 0,
                duration: 500
            },
            {
                layer: 'greece-israel',
                opacity: 0
            },
            {
                layer: 'ukraine-gaza-red-sea',
                opacity: 0
            },
            {
                layer: 'suez',
                opacity: 0
            },
            {
                layer: 'ukraine-gaza-red-sea (1)',
                opacity:0
            },
            {
                layer: 'sevastopol-odessa-istanbul (1)',
                opacity: 0
            },
            {
                layer: 'sevastopol-odessa-istanbul',
                opacity: 0
            },
            {
                layer: 'egypt',
                opacity: 0
            },
            {
                layer: 'greece',
                opacity: 0
            },
            {
                layer: 'bosporos',
                opacity: 0
            },
            {
                layer: 'bosporos (1)',
                opacity: 0
            },
            {
                layer: 'turkey',
                opacity: 0
            },
            {
                layer: 'george-double',
                opacity: 0
            },
            {
                layer: 'george-double (1)',
                opacity: 0
            },
            {
                layer: 'tel-aviv',
                opacity: 0
            },
            {
                layer: 'tel-aviv(1)',
                opacity: 0
            }
        ],
            onChapterExit: [{
                layer: 'three-seas',
                opacity: 0,
                duration: 50
            },
            {
                layer: 'three-seas (1)',
                opacity: 0,
                duration: 50
            }]
        },
        {
            id: 'tenth-chapter',
            alignment: 'right',
            hidden: false,
            title: '',
            image: './images/Catherine.png',
            caption: "Catherine the Great expanded Russia to the Black Sea. Painted by Alexander Roslin.",
            description: 'It was Catherine the Great who achieved her empire’s first warm water port by wresting from the Sultan the Crimea (and other territories which either remain part of or are claimed by Ukraine today). Moscow already had access to the Mediterranean through the 1774 Kuchuk Kainarji treaty, which allowed Russian merchant ships to transit the Bosporus and Dardanelles. After founding ports in Sevastopol and Odessa, Moscow sought to control Istanbul. Aside from being the world’s capital, as Napoleon Bonaparte quipped, its location controlled the only possible Russian exit onto the Mediterranean.<hr>',
            location: {
                center: [33.5254, 43.6166],
                zoom: 5,
                pitch: 0,
                bearing: 0,
                speed: 2, // make the flying slow
                curve: 1, // change the speed at which it zooms out
            },
            mapAnimation: 'flyTo',
            rotateAnimation: false,
            callback: '',
            onChapterEnter: [
                {
                    layer: 'sevastopol-odessa-istanbul (1)',
                    opacity: 1,
                    duration: 500
                },
                {
                    layer: 'sevastopol-odessa-istanbul',
                    opacity: 1,
                    duration: 500
                },

                {
                    layer: 'ottoman-geojson-6qspft',
                    opacity: 0,
                    duration: 500
                },
                {
                    layer: 'greece-israel',
                    opacity: 0
                },
                {
                    layer: 'ukraine-gaza-red-sea',
                    opacity: 0
                },
                {
                    layer: 'suez',
                    opacity: 0
                },
                {
                    layer: 'three-seas',
                    opacity: 0
                },
                {
                    layer: 'three-seas (1)',
                    opacity: 0
                },
                {
                    layer: 'ukraine-gaza-red-sea (1)',
                    opacity:0
                },
                {
                    layer: 'egypt',
                    opacity: 0
                },
                {
                    layer: 'greece',
                    opacity: 0
                },
                {
                    layer: 'bosporos',
                    opacity: 0
                },
                {
                    layer: 'bosporos (1)',
                    opacity: 0
                },
                {
                    layer: 'turkey',
                    opacity: 0
                },
                {
                    layer: 'george-double',
                    opacity: 0
                },
                {
                    layer: 'george-double (1)',
                    opacity: 0
                },
                {
                    layer: 'tel-aviv',
                    opacity: 0
                },
                {
                    layer: 'tel-aviv (1)',
                    opacity: 0
                }
            ],
            onChapterExit: []
        },
        {
            id: 'eleventh-chapter',
            alignment: 'left',
            hidden: false,
            title: '',
            image: './images/afissa.png',
            caption: "The Eastern Question dominated Mediterranean politics and debate in the 19th and early 20th centuries",
            description: 'Catherine’s Greek Plan intended to divide the Ottoman Empire between Russia and Austro-Hungary, with Istanbul emerging as the capital of a revived Byzantium. Judging Russia’s expansion to be detrimental to its interests, Britain switched sides and allied itself with the Ottomans, going to war in 1853 in the Crimean. Russia’s defeat resulted in the Black Sea being declared neutral, but by the start of the First World War it was again on the brink of seizing Istanbul (or Tsargrad, as it liked to call it). The Eastern Question - who would dominate the lands of the Ottoman Empire following its collapse - not only loomed heavier than ever, but was the main unappreciated reason why World War One was fought.<hr>',
            location: {
                center: [33.5254, 43.6166],
                zoom: 5,
                pitch: 0,
                bearing: 0,
                speed: 2, // make the flying slow
                curve: 1, // change the speed at which it zooms out
            },
            mapAnimation: 'flyTo',
            rotateAnimation: false,
            callback: '',
            onChapterEnter: [
                {
                    layer: 'sevastopol-odessa-istanbul (1)',
                    opacity: 1,
                    duration: 500
                },
                {
                    layer: 'sevastopol-odessa-istanbul',
                    opacity: 1,
                    duration: 500
                },
                
                {
                    layer: 'ottoman-geojson-6qspft',
                    opacity: 0,
                    duration: 500
                },
                {
                    layer: 'greece-israel',
                    opacity: 0
                },
                {
                    layer: 'ukraine-gaza-red-sea',
                    opacity: 0
                },
                {
                    layer: 'suez',
                    opacity: 0
                },
                {
                    layer: 'three-seas',
                    opacity: 0
                },
                {
                    layer: 'three-seas (1)',
                    opacity: 0
                },
                {
                    layer: 'ukraine-gaza-red-sea (1)',
                    opacity:0
                },
                {
                    layer: 'egypt',
                    opacity: 0
                },
                {
                    layer: 'greece',
                    opacity: 0
                },
                {
                    layer: 'bosporos',
                    opacity: 0
                },
                {
                    layer: 'bosporos (1)',
                    opacity: 0
                },
                {
                    layer: 'turkey',
                    opacity: 0
                },
                {
                    layer: 'george-double',
                    opacity: 0
                },
                {
                    layer: 'george-double (1)',
                    opacity: 0
                },
                {
                    layer: 'tel-aviv',
                    opacity: 0
                },
                {
                    layer: 'tel-aviv (1)',
                    opacity: 0
                }
            ],
            onChapterExit: []
        },
        {
            id: 'twelveth-chapter',
            alignment: 'right',
            hidden: false,
            title: '',
            image: '',
            description: "Even though the colonial era was at its peak, the Greek Revolution and Zionist calls to settle Palestine popularized the liberal idea that some peoples had a right to self-determination. Hellenism and Zionism both argued that their respective peoples – Greeks and Jews – were civilizationally unique, and sought to enshrine this in ethnically-exclusive states that were conceptualized as the ingathering of a diaspora. Where they differed was in their definition of what makes someone a Greek or a Jew. Remarkably, both the movements that would result in the creation of Greece and Israel developed in the Russian seaport of the Black Sea, Odessa. It was there that the Filiki Eteria and the Jewish Self-Defence Organization were founded in the 19th century, and Auto-Emancipation, a founding document of modern Jewish nationalism, composed. Poet Hayyim Nahman Bialik popularized the literary shift from Yiddish to Hebrew Zionist philosopher, while journalist Aḥad Haʿam’s writings in favour of regenerating Jewish culture gave rise both to the Odessa Style of essaying and to Cultural Zionism.",
            location: {
                center: [30.68370261651969, 46.54496744271263],
                zoom: 7,
                pitch: 0,
                bearing: 0,
                speed: 1, // make the flying slow
                curve: 1, // change the speed at which it zooms out
            },
            mapAnimation: 'flyTo',
            rotateAnimation: false,
            callback: '',
            onChapterEnter: [
                {
                    layer: 'sevastopol-odessa-istanbul (1)',
                    opacity: 1,
                    duration: 500
                },
                {
                    layer: 'sevastopol-odessa-istanbul',
                    opacity: 1,
                    duration: 500
                },

                {
                    layer: 'ottoman-geojson-6qspft',
                    opacity: 0,
                    duration: 500
                },
                {
                    layer: 'greece-israel',
                    opacity: 0
                },
                {
                    layer: 'ukraine-gaza-red-sea',
                    opacity: 0
                },
                {
                    layer: 'suez',
                    opacity: 0
                },
                {
                    layer: 'three-seas',
                    opacity: 0
                },
                {
                    layer: 'three-seas (1)',
                    opacity: 0
                },
                {
                    layer: 'ukraine-gaza-red-sea (1)',
                    opacity:0
                },
                {
                    layer: 'egypt',
                    opacity: 0
                },
                {
                    layer: 'greece',
                    opacity: 0
                },
                {
                    layer: 'bosporos',
                    opacity: 0
                },
                {
                    layer: 'bosporos (1)',
                    opacity: 0
                },
                {
                    layer: 'turkey',
                    opacity: 0
                },
                {
                    layer: 'george-double',
                    opacity: 0
                },
                {
                    layer: 'george-double (1)',
                    opacity: 0
                },
                {
                    layer: 'tel-aviv',
                    opacity: 0
                },
                {
                    layer: 'tel-aviv (1)',
                    opacity: 0
                }
            ],
            onChapterExit: []
        },
        {
            id: 'thirteenth-chapter',
            alignment: 'left',
            hidden: false,
            title: '',
            image: './images/Adamantios_Korais.png',
            caption: "Adamantios Korais was the most prominent of a group of intellectuals behind the Greek Enlightenment",
            description: "The success of the Greek Revolution showed the Zionists that an ancient nation could be resurrected, while the ancient Greek ideal of physical education that was revived in 19th century Europe fed into “muscular” Christian and Jewish movements of nationalists at odds with their religious establishments’ disdain for athleticism. Later on, the Greek-Turkish population exchange was seized on by Israeli politicians as a precedent for what could be applied to their Palestinian populations.<hr>",
            location: {
                center: [30.68370261651969, 46.54496744271263],
                zoom: 7,
                pitch: 0,
                bearing: 0,
                speed: 1, // make the flying slow
                curve: 1, // change the speed at which it zooms out
            },
            mapAnimation: 'flyTo',
            rotateAnimation: false,
            callback: '',
            onChapterEnter: [
                {
                    layer: 'sevastopol-odessa-istanbul (1)',
                    opacity: 1,
                    duration: 500
                },
                {
                    layer: 'sevastopol-odessa-istanbul',
                    opacity: 1,
                    duration: 500
                },

                {
                    layer: 'ottoman-geojson-6qspft',
                    opacity: 0,
                    duration: 500
                },
                {
                    layer: 'greece-israel',
                    opacity: 0
                },
                {
                    layer: 'ukraine-gaza-red-sea',
                    opacity: 0
                },
                {
                    layer: 'suez',
                    opacity: 0
                },
                {
                    layer: 'three-seas',
                    opacity: 0
                },
                {
                    layer: 'three-seas (1)',
                    opacity: 0
                },
                {
                    layer: 'ukraine-gaza-red-sea (1)',
                    opacity:0
                },
                {
                    layer: 'egypt',
                    opacity: 0
                },
                {
                    layer: 'greece',
                    opacity: 0
                },
                {
                    layer: 'bosporos',
                    opacity: 0
                },
                {
                    layer: 'bosporos (1)',
                    opacity: 0
                },
                {
                    layer: 'turkey',
                    opacity: 0
                },
                {
                    layer: 'george-double',
                    opacity: 0
                },
                {
                    layer: 'george-double (1)',
                    opacity: 0
                },
                {
                    layer: 'tel-aviv',
                    opacity: 0
                },
                {
                    layer: 'tel-aviv (1)',
                    opacity: 0
                }
            ],
            onChapterExit: [{
                layer: 'sevastopol-odessa-istanbul (1)',
                opacity: 0,
                duration: 50
            },
            {
                layer: 'sevastopol-odessa-istanbul',
                opacity: 0,
                duration: 50
            }]
        },
        {
            id: 'fourtheenth-chapter',
            alignment: 'right',
            hidden: false,
            title: '',
            image: './images/Napoleon.png',
            caption: "An 1806 French print by Louis François Couché of Napoleon granting freedom of worship to the Jews",
            description: "Across the Ottoman Empire, the Russians and French aspired to protect the Orthodox and Catholic Christian subjects. But with no significant Protestant Christian community in the Eastern Mediterranean, Britain struggled to acquire influence. Some policymakers identified its influential Jewish community as reason enough to consider sponsoring a Jewish homeland. Though Napoleon had already beaten the British to the promise upon taking of Gaza in 1798, it was the British who would realise it.<hr>",
            location: {
                center: [34.47349674145897, 31.53640866302672],
                zoom: 7,
                pitch: 0,
                bearing: 0,
                speed: 1, // make the flying slow
                curve: 1, // change the speed at which it zooms out
            },
            mapAnimation: 'flyTo',
            rotateAnimation: false,
            callback: '',
            onChapterEnter: [],
            onChapterExit: []
        },
        {
            id: 'fiftheenth-chapter',
            alignment: 'left',
            hidden: false,
            title: '',
            image: '',
            description: "<img src='./images/jeru.png'style='width: 100%; vertical-align: middle;'><span class='caption'>The Dome of the Rock complex in the late 19th century.</span><hr><br><br>From the 18th century onwards, Russia invested heavily in carving out influence in the Mediterranean in search of an anchorage by financing Orthodox ecclesiastical establishments and pilgrimages to Mount Athos and the Holy Land. Partially to counter Russia, the British established a consulate in Jerusalem in 1838. The second consul, James Finn, established the Palestine Exploration Fund, which conducted archaeological digs alongside intelligence activity. Russia established its own Imperial Orthodox Palestine Society in 1882 and sponsored so many of its devout to worship in Jerusalem that at Easter 1911 one in three people in the holy city was a Russian pilgrim. British consuls were generally supportive of Jewish immigration and in 1920 Herbert Samuel, a Zionist and the first Jew to head a British political party, was appointed High Commissioner for Palestine in a great fillip for the Zionist cause.",
            location: {
                center: [34.47349674145897, 31.53640866302672],
                zoom: 7,
                pitch: 0,
                bearing: 0,
                speed: 1, // make the flying slow
                curve: 1, // change the speed at which it zooms out
            },
            mapAnimation: 'flyTo',
            rotateAnimation: false,
            callback: '',
            onChapterEnter: [],
            onChapterExit: []
        },
        {
            id: 'sixteenth-chapter',
            alignment: 'right',
            hidden: false,
            title: '',
            image: '',
            description: "The urgency of keeping Russia out of the Mediterranean in the 1820s focused Britain on Greece, whose geography and extensive Mediterranean coastline tempted the powers. But it was Russia, even more than Britain, which acted on behalf of Greek independence. Prominent Greek revolutionaries Alexandros Ypsilantis and Ioannis Kapodistrias and members of the secret society that launched the revolution had been high-ranking officers in the Czar’s administration. It was Russian intel that the Ottomans were planning to swap the rebelled native Christian populace in the Peloponnese with Egyptian Muslim settlers brought in by Egypt’s Ibrahim Pasha (the so-called “barbarization project”) that sparked the public outrage which in turn prompted joint British-Russian action. The 1826 St Petersburg Protocol saw London and Moscow agree not to seek exclusive territorial gains in Greece nor “exclusive” political and economic influence, and paved the way for the Battle of Navarino in 1827. But even after that, the plan was for Greece to be only semi-autonomous within an Ottoman imperial context.",
            location: {
                center: [30.75487217170908, 38.03625128738383],
                zoom: 5,
                pitch: 0,
                bearing: 0,
                speed: 1, // make the flying slow
                curve: 1, // change the speed at which it zooms out
            },
            mapAnimation: 'flyTo',
            rotateAnimation: false,
            callback: '',
            onChapterEnter: [
                {
                    layer: 'greece',
                    opacity: 1,
                    duration: 500
                },
                {
                    layer: 'ottoman-geojson-6qspft',
                    opacity: 0,
                    duration: 500
                },
                {
                    layer: 'greece-israel',
                    opacity: 0
                },
                {
                    layer: 'ukraine-gaza-red-sea',
                    opacity: 0
                },
                {
                    layer: 'suez',
                    opacity: 0
                },
                {
                    layer: 'three-seas',
                    opacity: 0
                },
                {
                    layer: 'three-seas (1)',
                    opacity: 0
                },
                {
                    layer: 'ukraine-gaza-red-sea (1)',
                    opacity:0
                },
                {
                    layer: 'sevastopol-odessa-istanbul (1)',
                    opacity: 0
                },
                {
                    layer: 'sevastopol-odessa-istanbul',
                    opacity: 0
                },
                {
                    layer: 'egypt',
                    opacity: 0
                },
                {
                    layer: 'bosporos',
                    opacity: 0
                },
                {
                    layer: 'bosporos (1)',
                    opacity: 0
                },
                {
                    layer: 'turkey',
                    opacity: 0
                },
                {
                    layer: 'george-double',
                    opacity: 0
                },
                {
                    layer: 'george-double (1)',
                    opacity: 0
                },
                {
                    layer: 'tel-aviv',
                    opacity: 0
                },
                {
                    layer: 'tel-aviv (1)',
                    opacity: 0
                }
            ],
            onChapterExit: []
        },
        {
            id: 'seventeenth-chapter',
            alignment: 'left',
            hidden: false,
            title: '',
            image: '',
            description: "What finalized Greek independence was “not the plots and rebellions of Ali Pasha of Janina, not the battle of Navarino, not the French army in the Morea, not the conferences and protocols of London, but the march of Diebitsch’s Russians across the Balkan into the valley of the Maritza (Evros)”, Karl Marx argued in 1853 in the New York Tribune. But whereas Greek independence was dreamed up by subjects to the Czar in a Russian port and largely realized through Russian arms, Britain’s role was also defining, both before and after independence.",
            location: {
                center: [30.75487217170908, 38.03625128738383],
                zoom: 5,
                pitch: 0,
                bearing: 0,
                speed: 1, // make the flying slow
                curve: 1, // change the speed at which it zooms out
            },
            mapAnimation: 'flyTo',
            rotateAnimation: false,
            callback: '',
            onChapterEnter: [
                {
                    layer: 'greece',
                    opacity: 1,
                    duration: 500
                },
                {
                    layer: 'ottoman-geojson-6qspft',
                    opacity: 0,
                    duration: 500
                },
                {
                    layer: 'greece-israel',
                    opacity: 0
                },
                {
                    layer: 'ukraine-gaza-red-sea',
                    opacity: 0
                },
                {
                    layer: 'suez',
                    opacity: 0
                },
                {
                    layer: 'three-seas',
                    opacity: 0
                },
                {
                    layer: 'three-seas (1)',
                    opacity: 0
                },
                {
                    layer: 'ukraine-gaza-red-sea (1)',
                    opacity:0
                },
                {
                    layer: 'sevastopol-odessa-istanbul (1)',
                    opacity: 0
                },
                {
                    layer: 'sevastopol-odessa-istanbul',
                    opacity: 0
                },
                {
                    layer: 'egypt',
                    opacity: 0
                },
                {
                    layer: 'bosporos',
                    opacity: 0
                },
                {
                    layer: 'bosporos (1)',
                    opacity: 0
                },
                {
                    layer: 'turkey',
                    opacity: 0
                },
                {
                    layer: 'george-double',
                    opacity: 0
                },
                {
                    layer: 'george-double (1)',
                    opacity: 0
                },
                {
                    layer: 'tel-aviv',
                    opacity: 0
                },
                {
                    layer: 'tel-aviv (1)',
                    opacity: 0
                }
            ],
            onChapterExit: []
        },
        {
            id: 'eighteenth-chapter',
            alignment: 'right',
            hidden: false,
            title: '',
            image: './images/A_small_job_for_six_big_policemen.png',
            caption: "A small job for six big policemen,' reads the caption of a late C19th American magazine to a caricature depicting an infantile Greece accompanied by the six European Powers (England, Austria, France, Germany, Russia and Italy)",
            description: "By 1832, Greece had already bankrupted once by failing to service the £2,8m in loans it received from Britain and France. A second loan contracted to cover the regency’s expenses resulted in a further bankruptcy in 1843. It was becoming clear that its small size, rural and ethnically heterogeneous populations and mountainous, segmented terrain meant Greece would struggle to hang together as a viable state. But these handicaps took second place to the geopolitical importance it held for its patrons. Domestically, three parties dominated political life till the middle of the 19th century, and they were openly called British, French and Russian in reference to the interests they served. The British party was headed by Alexandros Mavrokordatos, who – as defeat loomed in 1825 – addressed a request for protection to George Canning pledging that a free Greece would conspire with Britain to keep Russia out of the Mediterranean. The overture, also known as the Act of Subordination (Πράξη Υποτέλειας), was an initial formal statement of intent by Greek politicians towards the Great Power. Greece was divested of economic and political sovereignty well before coming into being.<hr>",
            location: {
                center: [30.75487217170908, 38.03625128738383],
                zoom: 5,
                pitch: 0,
                bearing: 0,
                speed: 1, // make the flying slow
                curve: 1, // change the speed at which it zooms out
            },
            mapAnimation: 'flyTo',
            rotateAnimation: false,
            callback: '',
            onChapterEnter: [
                {
                    layer: 'greece',
                    opacity: 1,
                    duration: 500
                },
                {
                    layer: 'ottoman-geojson-6qspft',
                    opacity: 0,
                    duration: 500
                },
                {
                    layer: 'greece-israel',
                    opacity: 0
                },
                {
                    layer: 'ukraine-gaza-red-sea',
                    opacity: 0
                },
                {
                    layer: 'suez',
                    opacity: 0
                },
                {
                    layer: 'three-seas',
                    opacity: 0
                },
                {
                    layer: 'three-seas (1)',
                    opacity: 0
                },
                {
                    layer: 'ukraine-gaza-red-sea (1)',
                    opacity:0
                },
                {
                    layer: 'sevastopol-odessa-istanbul (1)',
                    opacity: 0
                },
                {
                    layer: 'sevastopol-odessa-istanbul',
                    opacity: 0
                },
                {
                    layer: 'egypt',
                    opacity: 0
                },
                {
                    layer: 'bosporos',
                    opacity: 0
                },
                {
                    layer: 'bosporos (1)',
                    opacity: 0
                },
                {
                    layer: 'turkey',
                    opacity: 0
                },
                {
                    layer: 'george-double',
                    opacity: 0
                },
                {
                    layer: 'george-double (1)',
                    opacity: 0
                },
                {
                    layer: 'tel-aviv',
                    opacity: 0
                },
                {
                    layer: 'tel-aviv (1)',
                    opacity: 0
                }
            ],
            onChapterExit: []
        },
        {
            id: 'ninetienth-chapter',
            alignment: 'left',
            hidden: false,
            title: '',
            image: '',
            description: '“Another act of subordination by the Greeks was their acceptance of a European king,” said Charalampos Minasidis, a research fellow at University College Dublin’s Centre for War Studies. “The Greek revolutionaries established the first Hellenic Republic on 1 January 1822 and fought various attempts to end it and establish dictatorial rule but lost, witnessing Greece’s transformation into an absolute monarchy.”',
            location: {
                center: [30.75487217170908, 38.03625128738383],
                zoom: 5,
                pitch: 0,
                bearing: 0,
                speed: 1, // make the flying slow
                curve: 1, // change the speed at which it zooms out
            },
            mapAnimation: 'flyTo',
            rotateAnimation: false,
            callback: '',
            onChapterEnter: [
                {
                    layer: 'greece',
                    opacity: 1,
                    duration: 500
                },
                {
                    layer: 'ottoman-geojson-6qspft',
                    opacity: 0,
                    duration: 500
                },
                {
                    layer: 'greece-israel',
                    opacity: 0
                },
                {
                    layer: 'ukraine-gaza-red-sea',
                    opacity: 0
                },
                {
                    layer: 'suez',
                    opacity: 0
                },
                {
                    layer: 'three-seas',
                    opacity: 0
                },
                {
                    layer: 'three-seas (1)',
                    opacity: 0
                },
                {
                    layer: 'ukraine-gaza-red-sea (1)',
                    opacity:0
                },
                {
                    layer: 'sevastopol-odessa-istanbul (1)',
                    opacity: 0
                },
                {
                    layer: 'sevastopol-odessa-istanbul',
                    opacity: 0
                },
                {
                    layer: 'egypt',
                    opacity: 0
                },
                {
                    layer: 'bosporos',
                    opacity: 0
                },
                {
                    layer: 'bosporos (1)',
                    opacity: 0
                },
                {
                    layer: 'turkey',
                    opacity: 0
                },
                {
                    layer: 'george-double',
                    opacity: 0
                },
                {
                    layer: 'george-double (1)',
                    opacity: 0
                },
                {
                    layer: 'tel-aviv',
                    opacity: 0
                },
                {
                    layer: 'tel-aviv (1)',
                    opacity: 0
                }
            ],
            onChapterExit: []
        },
        {
            id: 'twentienth-chapter',
            alignment: 'right',
            hidden: false,
            title: '',
            image: '',
            description: "Nevertheless, the new state enjoyed explosive territorial growth in its first century, reaching northwards to the Thracian plain and Rhodope mountains to absorb trading entrepôts like Salonica, Ioannina and Soufli. But its importance to British interests in the Mediterranean decreased after the Ottoman Empire ceded Cyprus to London in 1878 in return for protection during another of its 11 wars with Russia. Cyprus offered Britain a powerful land platform from which to launch interventions in the region and the two bases it retains on the island to this day are the only imperial possessions it kept in the Mediterranean, alongside Gibraltar at its gateway.",
            location: {
                center: [30.75487217170908, 38.03625128738383],
                zoom: 5,
                pitch: 0,
                bearing: 0,
                speed: 1, // make the flying slow
                curve: 1, // change the speed at which it zooms out
            },
            mapAnimation: 'flyTo',
            rotateAnimation: false,
            callback: '',
            onChapterEnter: [
                {
                    layer: 'greece',
                    opacity: 1,
                    duration: 500
                },
                {
                    layer: 'ottoman-geojson-6qspft',
                    opacity: 0,
                    duration: 500
                },
                {
                    layer: 'greece-israel',
                    opacity: 0
                },
                {
                    layer: 'ukraine-gaza-red-sea',
                    opacity: 0
                },
                {
                    layer: 'suez',
                    opacity: 0
                },
                {
                    layer: 'three-seas',
                    opacity: 0
                },
                {
                    layer: 'three-seas (1)',
                    opacity: 0
                },
                {
                    layer: 'ukraine-gaza-red-sea (1)',
                    opacity:0
                },
                {
                    layer: 'sevastopol-odessa-istanbul (1)',
                    opacity: 0
                },
                {
                    layer: 'sevastopol-odessa-istanbul',
                    opacity: 0
                },
                {
                    layer: 'egypt',
                    opacity: 0
                },
                {
                    layer: 'bosporos',
                    opacity: 0
                },
                {
                    layer: 'bosporos (1)',
                    opacity: 0
                },
                {
                    layer: 'turkey',
                    opacity: 0
                },
                {
                    layer: 'george-double',
                    opacity: 0
                },
                {
                    layer: 'george-double (1)',
                    opacity: 0
                },
                {
                    layer: 'tel-aviv',
                    opacity: 0
                },
                {
                    layer: 'tel-aviv (1)',
                    opacity: 0
                }
            ],
            onChapterExit: [,
                {
                    layer: 'greece',
                    opacity: 0,
                    duration: 50
                }]
        },
        {
            id: 'twentyone-chapter',
            alignment: 'left',
            hidden: false,
            title: '',
            image: '',
            description: "The British shift southwards towards Suez accelerated from 1875. In 1878, prominent British-Jewish banker Baron Lionel de Rothschild lent Prime Minister Benjamin Disraeli £4m to buy out the bankrupted Egyptian state’s share in the Suez Canal. In 1881, Britain declared a protectorate over Egypt after bombarding Alexandria and fighting two engagements in the vicinity of the Suez Canal. As its need to intervene in the Balkans waned, Germany increasingly replaced Britain as the Ottomans’ economic and military sponsor, leading the Ottoman Army to triumph over Greece in the 1897 war, constructing the Berlin-to-Baghdad railway line (an alternative to the Suez Canal connecting Germany to Middle Eastern oilfields), and setting the scene for the tensions that erupted in the First World War.",
            location: {
                center: [29.9553, 29.2156],
                zoom: 5,
                pitch: 0,
                bearing: 0,
                speed: 1, // make the flying slow
                curve: 1, // change the speed at which it zooms out
            },
            mapAnimation: 'flyTo',
            rotateAnimation: false,
            callback: '',
            onChapterEnter: [,
                {
                    layer: 'egypt',
                    opacity: 1,
                    duration: 500
                },
                {
                    layer: 'suez',
                    opacity: 1,
                    duration: 500
                },

                {
                    layer: 'ottoman-geojson-6qspft',
                    opacity: 0,
                    duration: 500
                },
                {
                    layer: 'greece-israel',
                    opacity: 0
                },
                {
                    layer: 'ukraine-gaza-red-sea',
                    opacity: 0
                },
                {
                    layer: 'three-seas',
                    opacity: 0
                },
                {
                    layer: 'three-seas (1)',
                    opacity: 0
                },
                {
                    layer: 'ukraine-gaza-red-sea (1)',
                    opacity:0
                },
                {
                    layer: 'sevastopol-odessa-istanbul (1)',
                    opacity: 0
                },
                {
                    layer: 'sevastopol-odessa-istanbul',
                    opacity: 0
                },
                {
                    layer: 'greece',
                    opacity: 0
                },
                {
                    layer: 'bosporos',
                    opacity: 0
                },
                {
                    layer: 'bosporos (1)',
                    opacity: 0
                },
                {
                    layer: 'turkey',
                    opacity: 0
                },
                {
                    layer: 'george-double',
                    opacity: 0
                },
                {
                    layer: 'george-double (1)',
                    opacity: 0
                },
                {
                    layer: 'tel-aviv',
                    opacity: 0
                },
                {
                    layer: 'tel-aviv (1)',
                    opacity: 0
                }
            ],
            onChapterExit: [,
                {
                    layer: 'egypt',
                    opacity: 0,
                    duration: 50
                },
                {
                    layer: 'suez',
                    opacity: 0,
                    duration: 50
                }
            ]
        },
        {
            id: 'twentytwo-chapter',
            alignment: 'right',
            hidden: false,
            title: 'Oil, Zionism and a World War',
            image: './images/herzl.png',
            caption:"Theodor Herzl was an Austro-Hungarian Jewish journalist and political activist and founder of the modern Zionist movement",
            description: "<span class='drop_cap'>A</span>t the dawn of the 20th century, two developments changed the face of the region: oil was discovered in large quantities, marking a naval shift away from coal, and Jewish emigration to Palestine picked up. Zionist leader Theodor Herzl had proposed a Jewish state as an antidote to rising anti-Semitism. The 1905 Zionist Congress passed over Argentina and Uganda to choose Palestine as the location for Israel. 11 new Jewish settlements were established between 1908 and the outbreak of World War One. Meanwhile, an ingenious Armenian-Ottoman banker called Calouste Gulbenkian brought Royal Dutch/Shell, the Deutsche Bank, and the Anglo-Persian Oil Company (today’s British Petroleum) into a vehicle called the Turkish Petroleum Company (TPC) in order to drill for oil on Ottoman lands. In 1915, even while British and Ottoman soldiers slaughtered each other at Gallipoli, Sinai and Mesopotamia, the Ottoman Grand Vizier promised the TPC an oil concession in the provinces of Baghdad and Mosul, a development whose repercussions resonate today. British state support for Anglo-Persian’s interests would be one of the reasons behind its greenlighting both the 1919 Greek invasion of Asia Minor and a Jewish Palestine.<hr>",
            location: {
                center: [29.9553, 31.2156],
                zoom: 4,
                pitch: 0,
                bearing: 0,
                speed: 1, // make the flying slow
                curve: 1, // change the speed at which it zooms out
            },
            mapAnimation: 'flyTo',
            rotateAnimation: false,
            callback: '',
            onChapterEnter: [],
            onChapterExit: []
        },
        {
            id: 'twentythree-chapter',
            alignment: 'left',
            hidden: false,
            title: '',
            image: '',
            description: "The Ottomans fought engagements in the runup to World War One with Italy and new Balkan nations formed on recently-Ottoman land. Beginning in 1911, the Italo-Turkish War set Ottoman fleets against an Italy struggling to become an imperial power in a series of battles in strategic locations of the Adriatic, Mediterranean and Red Sea. But the official start to World War One was a byproduct of the new nation-state fervour sweeping the region since Greece claimed its independence: a Serbian nationalist assassinated the heir to the Austro-Hungarian Empire in the streets of Sarajevo, marking the beginning of the end for three empires. By the First World War’s conclusion, there would be no Austro-Hungarian, Ottoman or Russian Empire remaining; and the Balkans and Middle East would be open to speculative restructuring.",
            location: {
                center: [29.9553, 31.2156],
                zoom: 4,
                pitch: 0,
                bearing: 0,
                speed: 1, // make the flying slow
                curve: 1, // change the speed at which it zooms out
            },
            mapAnimation: 'flyTo',
            rotateAnimation: false,
            callback: '',
            onChapterEnter: [],
            onChapterExit: []
        },
        {
            id: 'twentyfour-chapter',
            alignment: 'right',
            hidden: false,
            title: '',
            image: '',
            description: "Both Greece and the Ottoman Empire wanted to remain neutral but were forced into the war. Greece had sustained a famine-inducing naval blockade by the British during the Crimean War, gone bankrupt once again in 1893, and nearly lost Thessaly in its disastrous 1897 war with the Ottomans. But a British-French military blockade forced Athens into the war. The Ottoman entry was through a pre-emptive bombardment of the Russian port of Odessa precipitated by Turkish fears that the Russians were about to seize Istanbul and the straits. In fact, Russia had already secretly agreed with Britain and France that it would control Istanbul and the Dardanelles, but was foiled from following through by the October Revolution. The British also promised the Levant to Laurence of Arabia’s Arab allies, and sections of the same area to the French and its Jewish community. ",
            location: {
                center: [27.90189944872014, 38.889204688808455],
                zoom: 6,
                pitch: 0,
                bearing: 0,
                speed: 1, // make the flying slow
                curve: 1, // change the speed at which it zooms out
            },
            mapAnimation: 'flyTo',
            rotateAnimation: false,
            callback: '',
            onChapterEnter: [,
                {
                    layer: 'bosporos',
                    opacity: 1,
                    duration: 500
                },
                {
                    layer: 'bosporos (1)',
                    opacity: 1,
                    duration: 500
                },

                {
                    layer: 'ottoman-geojson-6qspft',
                    opacity: 0,
                    duration: 500
                },
                {
                    layer: 'greece-israel',
                    opacity: 0
                },
                {
                    layer: 'ukraine-gaza-red-sea',
                    opacity: 0
                },
                {
                    layer: 'suez',
                    opacity: 0
                },
                {
                    layer: 'three-seas',
                    opacity: 0
                },
                {
                    layer: 'three-seas (1)',
                    opacity: 0
                },
                {
                    layer: 'ukraine-gaza-red-sea (1)',
                    opacity:0
                },
                {
                    layer: 'sevastopol-odessa-istanbul (1)',
                    opacity: 0
                },
                {
                    layer: 'sevastopol-odessa-istanbul',
                    opacity: 0
                },
                {
                    layer: 'egypt',
                    opacity: 0
                },
                {
                    layer: 'greece',
                    opacity: 0
                },
                {
                    layer: 'turkey',
                    opacity: 0
                },
                {
                    layer: 'george-double',
                    opacity: 0
                },
                {
                    layer: 'george-double (1)',
                    opacity: 0
                },
                {
                    layer: 'tel-aviv',
                    opacity: 0
                },
                {
                    layer: 'tel-aviv (1)',
                    opacity: 0
                }
            ],
            onChapterExit: [,
                {
                    layer: 'bosporos',
                    opacity: 0,
                    duration: 50
                },
                {
                    layer: 'bosporos (1)',
                    opacity: 0,
                    duration: 50
                }
            ]
        },
        {
            id: 'twentyfive-chapter',
            alignment: 'left',
            hidden: false,
            title: '',
            image: '',
            description: "<img src='./images/ekstrateia-oykranias-1919-750x483.png'style='width: 100%; vertical-align: middle;'><span class='caption'>Greek soldiers of the 5/42 Evzone Regiment in Odessa</span><hr><br><br>Elated at being on the winning side at the end of the war, the Greeks dispatched an expeditionary force to southern Russia (modern-day Ukraine) in support of a French campaign against the Russian revolutionaries, but suffered 400 dead. At the Treaty of Sèvres in 1920, the West rewarded Greek loyalty with Eastern Thrace (except Gallipoli and Constantinople which the great powers intended to maintain influence over by internationalizing), and the Imvros and Tenedos islands, and was also handed a mandate for Izmir. The Ottoman Armenian and Kurdish minorities were also given generous homelands, which the British had earlier promised to the Russian Czar (before he was deposed). ",
            location: {
                center: [30.68370261651969, 46.54496744271263],
                zoom: 7,
                pitch: 0,
                bearing: 0,
                speed: 1, // make the flying slow
                curve: 1, // change the speed at which it zooms out
            },
            mapAnimation: 'flyTo',
            rotateAnimation: false,
            callback: '',
            onChapterEnter: [
                {
                    layer: 'sevastopol-odessa-istanbul (1)',
                    opacity: 1,
                    duration: 500
                },
                {
                    layer: 'sevastopol-odessa-istanbul',
                    opacity: 1,
                    duration: 500
                },
                {
                    layer: 'ottoman-geojson-6qspft',
                    opacity: 0,
                    duration: 500
                },
                {
                    layer: 'greece-israel',
                    opacity: 0
                },
                {
                    layer: 'ukraine-gaza-red-sea',
                    opacity: 0
                },
                {
                    layer: 'suez',
                    opacity: 0
                },
                {
                    layer: 'three-seas',
                    opacity: 0
                },
                {
                    layer: 'three-seas (1)',
                    opacity: 0
                },
                {
                    layer: 'ukraine-gaza-red-sea (1)',
                    opacity:0
                },
                {
                    layer: 'egypt',
                    opacity: 0
                },
                {
                    layer: 'greece',
                    opacity: 0
                },
                {
                    layer: 'bosporos',
                    opacity: 0
                },
                {
                    layer: 'bosporos (1)',
                    opacity: 0
                },
                {
                    layer: 'turkey',
                    opacity: 0
                },
                {
                    layer: 'george-double',
                    opacity: 0
                },
                {
                    layer: 'george-double (1)',
                    opacity: 0
                },
                {
                    layer: 'tel-aviv',
                    opacity: 0
                },
                {
                    layer: 'tel-aviv (1)',
                    opacity: 0
                }
            ],
            onChapterExit: [{
                layer: 'sevastopol-odessa-istanbul (1)',
                opacity: 0,
                duration: 50
            },
            {
                layer: 'sevastopol-odessa-istanbul',
                opacity: 0,
                duration: 50
            }]
        },
        {
            id: 'twentysix-chapter',
            alignment: 'right',
            hidden: false,
            title: '',
            image: '',
            description: "Britain was now anxious to relieve its one million exhausted soldiers in the Middle East and Greek Prime Minister Eleftherios Venizelos only too eager to facilitate. He dispatched the Greek Army into Asia Minor, intending to enforce Sèvres and claim further territories of Greek-speaking, Orthodox-Christian Rum. But the new Communist leadership in Moscow had been alienated by the Greek intervention in Ukraine and wanted the Europeans out of what they perceived as their backyard. So they concluded a treaty with Turkish leader Kemal Ataturk and sent him two million gold Imperial rubles, 60,000 rifles, and 100 artillery pieces. Ataturk defeated the Greek army, founded the Turkish Republic after expelling up to 1.5 million Rum, and closed the door on Greece’s century-long expansion.",
            location: {
                center: [35.186352980951625, 39.062452273899865],
                zoom: 5,
                pitch: 0,
                bearing: 0,
                speed: 1, // make the flying slow
                curve: 1, // change the speed at which it zooms out
            },
            mapAnimation: 'flyTo',
            rotateAnimation: false,
            callback: '',
            onChapterEnter: [
                {
                    layer: 'turkey',
                    opacity: 1,
                    duration: 500
                },
                {
                    layer: 'ottoman-geojson-6qspft',
                    opacity: 0,
                    duration: 500
                },
                {
                    layer: 'greece-israel',
                    opacity: 0
                },
                {
                    layer: 'ukraine-gaza-red-sea',
                    opacity: 0
                },
                {
                    layer: 'suez',
                    opacity: 0
                },
                {
                    layer: 'three-seas',
                    opacity: 0
                },
                {
                    layer: 'three-seas (1)',
                    opacity: 0
                },
                {
                    layer: 'ukraine-gaza-red-sea (1)',
                    opacity:0
                },
                {
                    layer: 'sevastopol-odessa-istanbul (1)',
                    opacity: 0
                },
                {
                    layer: 'sevastopol-odessa-istanbul',
                    opacity: 0
                },
                {
                    layer: 'egypt',
                    opacity: 0
                },
                {
                    layer: 'greece',
                    opacity: 0
                },
                {
                    layer: 'bosporos',
                    opacity: 0
                },
                {
                    layer: 'bosporos (1)',
                    opacity: 0
                },
                {
                    layer: 'george-double',
                    opacity: 0
                },
                {
                    layer: 'george-double (1)',
                    opacity: 0
                },
                {
                    layer: 'tel-aviv',
                    opacity: 0
                },
                {
                    layer: 'tel-aviv (1)',
                    opacity: 0
                }
            ],
            onChapterExit: [{
                layer: 'turkey',
                opacity: 0,
                duration: 50
            }
        ]
        },
        {
            id: 'twentyseven-chapter',
            alignment: 'left',
            hidden: false,
            title: '',
            image: '',
            description: "By 1922, Britain was the least drained of the European great powers. Its imperial rivals had vanished, and London retained most of its empire even as it moved to ensure the oil supplies that would maintain its impetus. The coming decades would see it replace its Palestine mandate with an Israel, but also surrender the Mediterranean to an oil-producing Atlantic power that had once been its colony. As for Greece, it was in for a rough 20th century.",
            location: {
                center: [23.8243, 37.074],
                zoom: 4.2,
                pitch: 0,
                bearing: 0,
                speed: 1, // make the flying slow
                curve: 1, // change the speed at which it zooms out
            },
            mapAnimation: 'flyTo',
            rotateAnimation: false,
            callback: '',
            onChapterEnter: [],
            onChapterExit: []
        },
        {
            id: 'twentyeight-chapter',
            alignment: 'center',
            hidden: false,
            title: '',
            image: '',
            description: "<div style='text-align: center;'>Written by Iasonas Athanasiadis<br>Visualization by Thanasis Troboukis<br>Editor Dimitris Bounias</div><br><b>Relevant links</b><br><a href=''></a>",
            location: {
                center: [23.8243, 37.074],
                zoom: 4.2,
                pitch: 0,
                bearing: 0,
                speed: 1, // make the flying slow
                curve: 1, // change the speed at which it zooms out
            },
            mapAnimation: 'flyTo',
            rotateAnimation: false,
            callback: '',
            onChapterEnter: [],
            onChapterExit: []
        }
    ]
};


