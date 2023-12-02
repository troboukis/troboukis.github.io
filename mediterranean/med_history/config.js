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
            title: 'Περιγραφή',
            image: './images/sevastopol.png',
            description: 'Μια μικρή περιγραφή',
            showMarkers: false,
            location: {
                center: [22.0480, 34.5531],
                zoom: 5,
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
            title: 'Sevastopol',
            image: '',
            description: 'founded by Russia in 1783 as its first warm-water port and base of its Black Sea fleet',
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
            title: 'Odessa',
            image: '',
            description: 'founded by Russia in 1794 as a major trade port. A Greek Army detachment landed here in 1919 in support of an unsuccessful French campaign against the Bolsheviks.',
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
            title: 'Istanbul',
            image: '',
            description: 'Russia seeks to dominate Istanbul and the Straits politically or militarily in order to maintain access to the Mediterranean',
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
            description: 'Great Britain, France, and Russia destroyed the Ottoman fleet in 1827',
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
            title: 'Piraeus',
            image: '',
            description: 'An Allied force lands to force Greece to join World War One on its side ',
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
            alignment: 'fully',
            hidden: false,
            title: 'Jerusalem',
            image: '',
            description: 'Russia and Britain opened consulates in 1838 and 1858 respectively',
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
            alignment: 'fully',
            hidden: false,
            title: 'Suez Canal',
            image: '',
            description: 'Sparked increased Great Power competition over Mediterranean trade dominance after it became operational in 1869',
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
            alignment: 'fully',
            hidden: false,
            title: 'Cyprus',
            image: '',
            description: 'Britain gained a valuable Mediterranean foothold in 1878 by taking control of Cyprus',
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
            alignment: 'fully',
            hidden: false,
            title: 'Preveza',
            image: '',
            description: 'Scene of Ottoman Empire’s greatest naval victory against a Holy League fleet in 1538, but also a 1911 defeat during the Italo-Turkish War ',
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
            alignment: 'fully',
            hidden: false,
            title: 'Alexandria',
            image: '',
            description: 'Britain bombarded it in 1881 as part of its military takeover of Egypt',
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
        }
    ]
};
