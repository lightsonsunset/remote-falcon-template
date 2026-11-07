import {normalizeReleaseMetadataForBaseline} from './helpers/release-metadata.js';
// Independently captured before colour override implementation.
const baseline={
  "festive/christmas/header/plain/false": "d50ede6a580327e7b38782c3b29bcabac412219a4a373f682eeac284b8baf0ff",
  "festive/christmas/header/plain/true": "7a64337afc207fc05dc1ac069cde12e8bc4024b253484631a8d2104ec84fa771",
  "festive/christmas/header/card/false": "d50ede6a580327e7b38782c3b29bcabac412219a4a373f682eeac284b8baf0ff",
  "festive/christmas/header/card/true": "473a26c850822a4a8d359d5e7e36b15abbcc6e4d880453816808d3bb781c50de",
  "festive/christmas/above-header/plain/false": "d50ede6a580327e7b38782c3b29bcabac412219a4a373f682eeac284b8baf0ff",
  "festive/christmas/above-header/plain/true": "6f3923f10586d69dd9805f93b815ca09b2dbdfce2f7336e2bb507ac53ae8e859",
  "festive/christmas/above-header/card/false": "d50ede6a580327e7b38782c3b29bcabac412219a4a373f682eeac284b8baf0ff",
  "festive/christmas/above-header/card/true": "fb81dd95256f93103ab5ff97763ac39e9f449efde55f096d5597e0b5a4c614d2",
  "festive/christmas/below-header/plain/false": "d50ede6a580327e7b38782c3b29bcabac412219a4a373f682eeac284b8baf0ff",
  "festive/christmas/below-header/plain/true": "50cc9afafbb8100bb385ef9b3743757604b8af67179b366ab9b87d372dcd2afd",
  "festive/christmas/below-header/card/false": "d50ede6a580327e7b38782c3b29bcabac412219a4a373f682eeac284b8baf0ff",
  "festive/christmas/below-header/card/true": "b35fbf7a6ab4501ce3841eb09f0d6f7bef408dd4f7f500fa06d648c39ad4a721",
  "festive/christmas/status/plain/false": "d50ede6a580327e7b38782c3b29bcabac412219a4a373f682eeac284b8baf0ff",
  "festive/christmas/status/plain/true": "81a747868e6b53e56f3d962f247ab24e6182405a2dd9b5a441cd406fdb8eaeb2",
  "festive/christmas/status/card/false": "d50ede6a580327e7b38782c3b29bcabac412219a4a373f682eeac284b8baf0ff",
  "festive/christmas/status/card/true": "0a86410550233b3f5db2f26353fb3610d3b1499ffe5c9b379ef8d103ad7bbfa3",
  "festive/halloween/header/plain/false": "8da228762a6064edb56492ecade964e4e61e92717dc8df053ebd560e3b972d4c",
  "festive/halloween/header/plain/true": "badcf1d13b98d29ea2a0c8c3801cfffed79318d95a6ffda964857453149c8ecd",
  "festive/halloween/header/card/false": "8da228762a6064edb56492ecade964e4e61e92717dc8df053ebd560e3b972d4c",
  "festive/halloween/header/card/true": "5c499f9fffb0ed42a45477d50e0ea0b44eb8822cbf093ed0b9ffc51ae12701a1",
  "festive/halloween/above-header/plain/false": "8da228762a6064edb56492ecade964e4e61e92717dc8df053ebd560e3b972d4c",
  "festive/halloween/above-header/plain/true": "5442b1cd39d3b9f9d5874750bf37185c2bd55b3dc0017ca4ad70c6a5c6b387a2",
  "festive/halloween/above-header/card/false": "8da228762a6064edb56492ecade964e4e61e92717dc8df053ebd560e3b972d4c",
  "festive/halloween/above-header/card/true": "5eaf230ba26c6dbeb2022461106a09a4fba8dfa50f720c6e3b15ead7890eda63",
  "festive/halloween/below-header/plain/false": "8da228762a6064edb56492ecade964e4e61e92717dc8df053ebd560e3b972d4c",
  "festive/halloween/below-header/plain/true": "5aaf9414dc399bb6b22f11dcbf90da63ef68a1276f0a1f5b04001d5c2a4eb87f",
  "festive/halloween/below-header/card/false": "8da228762a6064edb56492ecade964e4e61e92717dc8df053ebd560e3b972d4c",
  "festive/halloween/below-header/card/true": "896359c80002aa2dfbd2ef02ded8d977108cfa901196f1c54c7ba77b0b02ae6f",
  "festive/halloween/status/plain/false": "8da228762a6064edb56492ecade964e4e61e92717dc8df053ebd560e3b972d4c",
  "festive/halloween/status/plain/true": "09ca5ee08482295f8337e2dbf0ccde7e3961de3b09228798dfa2999ecfde7dc6",
  "festive/halloween/status/card/false": "8da228762a6064edb56492ecade964e4e61e92717dc8df053ebd560e3b972d4c",
  "festive/halloween/status/card/true": "95b312dd878815e5cc01f46523e210ed72ae5bfd7dcb7efbea79a28d7627b3c7",
  "festive/thanksgiving/header/plain/false": "11457c0f42bf0af56c5614c4b043f373eb22867ab460b76ff8bed4534d56bfd0",
  "festive/thanksgiving/header/plain/true": "d0078fe298475f4937310b40f0ba198067967b89a9a8b1c8ee0b40c7d6f8392e",
  "festive/thanksgiving/header/card/false": "11457c0f42bf0af56c5614c4b043f373eb22867ab460b76ff8bed4534d56bfd0",
  "festive/thanksgiving/header/card/true": "1348bf858e23790427101afe1e132b87a483970d3ca514459a1896f19683efcf",
  "festive/thanksgiving/above-header/plain/false": "11457c0f42bf0af56c5614c4b043f373eb22867ab460b76ff8bed4534d56bfd0",
  "festive/thanksgiving/above-header/plain/true": "35ce7c125f8da04a846536c9c7ea2faa8d34cc0ac69bcbfe6588476d9c1581ed",
  "festive/thanksgiving/above-header/card/false": "11457c0f42bf0af56c5614c4b043f373eb22867ab460b76ff8bed4534d56bfd0",
  "festive/thanksgiving/above-header/card/true": "c591ed4ec1745a3027425da7f85b54e2ca66680c7824ca31b588eea47777cf5a",
  "festive/thanksgiving/below-header/plain/false": "11457c0f42bf0af56c5614c4b043f373eb22867ab460b76ff8bed4534d56bfd0",
  "festive/thanksgiving/below-header/plain/true": "bb2098cb6b4549f27f019cdcce106a1cbc9dcf594a683a949a098fb4b48619f6",
  "festive/thanksgiving/below-header/card/false": "11457c0f42bf0af56c5614c4b043f373eb22867ab460b76ff8bed4534d56bfd0",
  "festive/thanksgiving/below-header/card/true": "4c88752d6257d5c74277890fa596c33075a51e0da649cdcf7e8c13458719badf",
  "festive/thanksgiving/status/plain/false": "11457c0f42bf0af56c5614c4b043f373eb22867ab460b76ff8bed4534d56bfd0",
  "festive/thanksgiving/status/plain/true": "585ac0dca7f391876ae265cbde6bea49bbdfecaf5e15e6fbceb741f0ec6011ec",
  "festive/thanksgiving/status/card/false": "11457c0f42bf0af56c5614c4b043f373eb22867ab460b76ff8bed4534d56bfd0",
  "festive/thanksgiving/status/card/true": "85a03c4652e390ac87c50461e47d46905cf123ee0e9db982de61dedb0e263a8a",
  "festive/australia-day/header/plain/false": "eecc576b104471f7abdb0c09f99afdd8496c174b0ecfea153ca20ec9d4f58a64",
  "festive/australia-day/header/plain/true": "99db6ec0449e40a9dd3af5124b536590beff0637c11158d4c3d82575b55f3454",
  "festive/australia-day/header/card/false": "eecc576b104471f7abdb0c09f99afdd8496c174b0ecfea153ca20ec9d4f58a64",
  "festive/australia-day/header/card/true": "eefe252a56e551fba3de61995da127dc2d89ef729be7d36838018f65cfcb1912",
  "festive/australia-day/above-header/plain/false": "eecc576b104471f7abdb0c09f99afdd8496c174b0ecfea153ca20ec9d4f58a64",
  "festive/australia-day/above-header/plain/true": "d448a1f84aeef4d134674efda331fa92650016af5c2f714672a1d2ef9f40c1bc",
  "festive/australia-day/above-header/card/false": "eecc576b104471f7abdb0c09f99afdd8496c174b0ecfea153ca20ec9d4f58a64",
  "festive/australia-day/above-header/card/true": "601c8ebaa4a653a615ca9f20d4bd22e6b993525c97d2484ec0ada5a015a8db79",
  "festive/australia-day/below-header/plain/false": "eecc576b104471f7abdb0c09f99afdd8496c174b0ecfea153ca20ec9d4f58a64",
  "festive/australia-day/below-header/plain/true": "1e6456ed6c904df57f2cfdabf549fd3ba35a13e627c066a85ce95c12394453db",
  "festive/australia-day/below-header/card/false": "eecc576b104471f7abdb0c09f99afdd8496c174b0ecfea153ca20ec9d4f58a64",
  "festive/australia-day/below-header/card/true": "a58df2fd4a7c03d9492fe087ce4c00b18243ad565df8c6b4e741793e8844617c",
  "festive/australia-day/status/plain/false": "eecc576b104471f7abdb0c09f99afdd8496c174b0ecfea153ca20ec9d4f58a64",
  "festive/australia-day/status/plain/true": "84a97cb8aec89c332a4aef0615fb095b3a3e18bd14eeee962050a2906a392f63",
  "festive/australia-day/status/card/false": "eecc576b104471f7abdb0c09f99afdd8496c174b0ecfea153ca20ec9d4f58a64",
  "festive/australia-day/status/card/true": "91f304d55ec5b6880bb9a9c3fbdea69ec52b5134480124b674c7ac50ac557c1e",
  "festive/us-patriotic/header/plain/false": "0530385c4b580d807914c3df913d72fa5137e60209f6f6b4641e88a06aa2631a",
  "festive/us-patriotic/header/plain/true": "982e3d90ab4dfc32e679c27d893b1d71efb0a01c73d33d47175c5a30c5443b28",
  "festive/us-patriotic/header/card/false": "0530385c4b580d807914c3df913d72fa5137e60209f6f6b4641e88a06aa2631a",
  "festive/us-patriotic/header/card/true": "ae2c3d44e75219c779d82a759b2c2ffe41e4d576733b036ce6b3e1b9f3e3c56d",
  "festive/us-patriotic/above-header/plain/false": "0530385c4b580d807914c3df913d72fa5137e60209f6f6b4641e88a06aa2631a",
  "festive/us-patriotic/above-header/plain/true": "00af0fdf8e2c9181c72c304aeb7b9a9e5e7ebb71258ee038dae87d05f241e4a5",
  "festive/us-patriotic/above-header/card/false": "0530385c4b580d807914c3df913d72fa5137e60209f6f6b4641e88a06aa2631a",
  "festive/us-patriotic/above-header/card/true": "b403df136a3e7448a450b2ebd482648822d9941593b3fce5fe5f38e329db5006",
  "festive/us-patriotic/below-header/plain/false": "0530385c4b580d807914c3df913d72fa5137e60209f6f6b4641e88a06aa2631a",
  "festive/us-patriotic/below-header/plain/true": "f3adfc11b62e81a04ae7c8479b9f06dad121d4d60898d1ee0a23decca346167e",
  "festive/us-patriotic/below-header/card/false": "0530385c4b580d807914c3df913d72fa5137e60209f6f6b4641e88a06aa2631a",
  "festive/us-patriotic/below-header/card/true": "0a46f6be9e5e10b57e4d0f1966bee18a9a92452abda903ecc55b64d1ed9c3645",
  "festive/us-patriotic/status/plain/false": "0530385c4b580d807914c3df913d72fa5137e60209f6f6b4641e88a06aa2631a",
  "festive/us-patriotic/status/plain/true": "63d35304155f376878c658900cdefd771c2a3f13ad901d1756a4f8f9ee143691",
  "festive/us-patriotic/status/card/false": "0530385c4b580d807914c3df913d72fa5137e60209f6f6b4641e88a06aa2631a",
  "festive/us-patriotic/status/card/true": "d5d3689f26f19787c5446e4f3fcda4d47153c2bf2b49149454f8892af73eacb2",
  "festive/valentines-day/header/plain/false": "5af161065d8895da651e24e4efbcc07fb037dcae1490779eb96e727cc80696a1",
  "festive/valentines-day/header/plain/true": "9bd460954fa35dfb04383861510b604afc02cb57356575790b9ac094a0e561f3",
  "festive/valentines-day/header/card/false": "5af161065d8895da651e24e4efbcc07fb037dcae1490779eb96e727cc80696a1",
  "festive/valentines-day/header/card/true": "b6cadb5b18c0c0e04a6bf18801e0e1b914c831ac7e7d3c4623aac069fcecd40b",
  "festive/valentines-day/above-header/plain/false": "5af161065d8895da651e24e4efbcc07fb037dcae1490779eb96e727cc80696a1",
  "festive/valentines-day/above-header/plain/true": "ec7893754123b923529ce803ac3c8eaea67205d62d6590850b884b80caf0bf18",
  "festive/valentines-day/above-header/card/false": "5af161065d8895da651e24e4efbcc07fb037dcae1490779eb96e727cc80696a1",
  "festive/valentines-day/above-header/card/true": "c77337862dc4c1d754aff1812e0e5d45feac532e417a32781ed14be8c9621137",
  "festive/valentines-day/below-header/plain/false": "5af161065d8895da651e24e4efbcc07fb037dcae1490779eb96e727cc80696a1",
  "festive/valentines-day/below-header/plain/true": "5a2419fa7173fbccbd7bb67840693c5317336295612ed294bc1e02488d989166",
  "festive/valentines-day/below-header/card/false": "5af161065d8895da651e24e4efbcc07fb037dcae1490779eb96e727cc80696a1",
  "festive/valentines-day/below-header/card/true": "ae8556bfcad6908ddea3f3897a84dd121e9d994fa866c0ebac38133d5d5485ec",
  "festive/valentines-day/status/plain/false": "5af161065d8895da651e24e4efbcc07fb037dcae1490779eb96e727cc80696a1",
  "festive/valentines-day/status/plain/true": "c7fd5b5e1cc3e24eecfb7575176beab87baf820b3639e590972f9ffffe8a26ad",
  "festive/valentines-day/status/card/false": "5af161065d8895da651e24e4efbcc07fb037dcae1490779eb96e727cc80696a1",
  "festive/valentines-day/status/card/true": "cba3cb31b218f77238eb0aeaecf296f17b7105fd7795c52958bfd76db86f9bb3",
  "compact-console/christmas/header/plain/false": "f2b6f86c53b522ce0cb16ca77f36eee363a82559843b6e48c3cb39e67292b809",
  "compact-console/christmas/header/plain/true": "e2fbd3cd8506a4dcd822821d001fad15d2025498a7002c4ced1637e1520a3c15",
  "compact-console/christmas/header/card/false": "f2b6f86c53b522ce0cb16ca77f36eee363a82559843b6e48c3cb39e67292b809",
  "compact-console/christmas/header/card/true": "c4bd5af6da6d138544139021577b5d0e2be69c28445032c55cb064534dd367a4",
  "compact-console/christmas/above-header/plain/false": "f2b6f86c53b522ce0cb16ca77f36eee363a82559843b6e48c3cb39e67292b809",
  "compact-console/christmas/above-header/plain/true": "a6680e192ca0557ac168c7a7af5629cfcba8dda980988273958984e028086228",
  "compact-console/christmas/above-header/card/false": "f2b6f86c53b522ce0cb16ca77f36eee363a82559843b6e48c3cb39e67292b809",
  "compact-console/christmas/above-header/card/true": "8cc33fecadce66a704762e980d02cc315fac6d5a0d7cf52b397aee498042d50c",
  "compact-console/christmas/below-header/plain/false": "f2b6f86c53b522ce0cb16ca77f36eee363a82559843b6e48c3cb39e67292b809",
  "compact-console/christmas/below-header/plain/true": "4c6393d8dcc9ea1f5cc8659f458b271d09f73596e10e494624156784630ffa29",
  "compact-console/christmas/below-header/card/false": "f2b6f86c53b522ce0cb16ca77f36eee363a82559843b6e48c3cb39e67292b809",
  "compact-console/christmas/below-header/card/true": "874f01ce2adeaf72459a1edba10eac51beabcef32c0acbaaa7716512855cc04c",
  "compact-console/christmas/status/plain/false": "f2b6f86c53b522ce0cb16ca77f36eee363a82559843b6e48c3cb39e67292b809",
  "compact-console/christmas/status/plain/true": "244d779892a4c89a5f7b85d78af4cb5cfc44da226cc5369d210cc535d0a3d8d3",
  "compact-console/christmas/status/card/false": "f2b6f86c53b522ce0cb16ca77f36eee363a82559843b6e48c3cb39e67292b809",
  "compact-console/christmas/status/card/true": "d951a7469afcc693700872e4ed5111c234931259a0fa389dfad7c05cce35da57",
  "compact-console/halloween/header/plain/false": "a853c23ee2ac30b4246a76396f4a3d2cf73a31e71bf912e0b62a8f1f4cfffbdc",
  "compact-console/halloween/header/plain/true": "41a9caa0473d46ccae9171569afa1aa051fba4ccb67e0502109608a1a5a84d12",
  "compact-console/halloween/header/card/false": "a853c23ee2ac30b4246a76396f4a3d2cf73a31e71bf912e0b62a8f1f4cfffbdc",
  "compact-console/halloween/header/card/true": "b7501c9fc7378db8d0b33c6f5b28b0a24dd41f2b942f1c6e78782ef028da4499",
  "compact-console/halloween/above-header/plain/false": "a853c23ee2ac30b4246a76396f4a3d2cf73a31e71bf912e0b62a8f1f4cfffbdc",
  "compact-console/halloween/above-header/plain/true": "31880dfa8474ed0237f513a3a98dc8930a8f6514386a08baec7601349bd94e77",
  "compact-console/halloween/above-header/card/false": "a853c23ee2ac30b4246a76396f4a3d2cf73a31e71bf912e0b62a8f1f4cfffbdc",
  "compact-console/halloween/above-header/card/true": "6430651d992bddb884d294fdb71d284c860d3999b21c612704a0c47aec1e9266",
  "compact-console/halloween/below-header/plain/false": "a853c23ee2ac30b4246a76396f4a3d2cf73a31e71bf912e0b62a8f1f4cfffbdc",
  "compact-console/halloween/below-header/plain/true": "c7361ce2cfa7ff1862aa1a6a851ed077cef51ba26b34f2cb6b639a76d7dc953c",
  "compact-console/halloween/below-header/card/false": "a853c23ee2ac30b4246a76396f4a3d2cf73a31e71bf912e0b62a8f1f4cfffbdc",
  "compact-console/halloween/below-header/card/true": "ad4d33fbb99a7cf0cbc291e4aa4d9f58416c505ea2700d703d4f7efbeb405f8b",
  "compact-console/halloween/status/plain/false": "a853c23ee2ac30b4246a76396f4a3d2cf73a31e71bf912e0b62a8f1f4cfffbdc",
  "compact-console/halloween/status/plain/true": "f378d96cd16d75923893634eba456a72b3dfff5c8f365636754ff5313417b64a",
  "compact-console/halloween/status/card/false": "a853c23ee2ac30b4246a76396f4a3d2cf73a31e71bf912e0b62a8f1f4cfffbdc",
  "compact-console/halloween/status/card/true": "a4c3d9b267edc572e6be7e8d22e16762e8de070574b0756701af12a814b27713",
  "compact-console/thanksgiving/header/plain/false": "cf9151ef2ef481c291cd1874f727f6c7c7ffac91c919fce5656da74f7f3541ee",
  "compact-console/thanksgiving/header/plain/true": "6352d4bcc13ea675d9b8de19421d91602e2cfbc9291fda0ca64ef3ce8273f2cd",
  "compact-console/thanksgiving/header/card/false": "cf9151ef2ef481c291cd1874f727f6c7c7ffac91c919fce5656da74f7f3541ee",
  "compact-console/thanksgiving/header/card/true": "bb552516450764b8af94a2921111d3cd682136a3ea78ade4ed821bcce2d2051d",
  "compact-console/thanksgiving/above-header/plain/false": "cf9151ef2ef481c291cd1874f727f6c7c7ffac91c919fce5656da74f7f3541ee",
  "compact-console/thanksgiving/above-header/plain/true": "50ea17e7bc636b9bc87fb0c8d7380fb7c861f883ccd759d1984c4340417d6484",
  "compact-console/thanksgiving/above-header/card/false": "cf9151ef2ef481c291cd1874f727f6c7c7ffac91c919fce5656da74f7f3541ee",
  "compact-console/thanksgiving/above-header/card/true": "a3954080c40efad862561c6a032d4de24a0afbdeb318ed06fecb890cf94e800d",
  "compact-console/thanksgiving/below-header/plain/false": "cf9151ef2ef481c291cd1874f727f6c7c7ffac91c919fce5656da74f7f3541ee",
  "compact-console/thanksgiving/below-header/plain/true": "2ff0da3eac88c8d77a8b8ccee8b14fc9d8cf27f6ac2cc4ed035ab2c5071124d7",
  "compact-console/thanksgiving/below-header/card/false": "cf9151ef2ef481c291cd1874f727f6c7c7ffac91c919fce5656da74f7f3541ee",
  "compact-console/thanksgiving/below-header/card/true": "0155e2cce93a45aa79bb3d7663ee58d3881a55e927781a486dd57853b47a25d3",
  "compact-console/thanksgiving/status/plain/false": "cf9151ef2ef481c291cd1874f727f6c7c7ffac91c919fce5656da74f7f3541ee",
  "compact-console/thanksgiving/status/plain/true": "d67573428a93b0c6a16dffb098aefe561ee0a0140bcb546c2514085f0033d52c",
  "compact-console/thanksgiving/status/card/false": "cf9151ef2ef481c291cd1874f727f6c7c7ffac91c919fce5656da74f7f3541ee",
  "compact-console/thanksgiving/status/card/true": "567dfaa7394de30a34a363ab9773338d529f6e96f2537f887ad8942498d49910",
  "compact-console/australia-day/header/plain/false": "da9249f928954b58dd0be23180b36ce664a9796b2755d67fe7b7d4f188e6b025",
  "compact-console/australia-day/header/plain/true": "f71bbe128deaf135a026760dece0878e85dfe91100b78b2b261c002f351d6ac3",
  "compact-console/australia-day/header/card/false": "da9249f928954b58dd0be23180b36ce664a9796b2755d67fe7b7d4f188e6b025",
  "compact-console/australia-day/header/card/true": "0fbf85790b2d8a0d8c6049db098e9031b1d4ae6bc56e6230e2d6a55cf37c3d21",
  "compact-console/australia-day/above-header/plain/false": "da9249f928954b58dd0be23180b36ce664a9796b2755d67fe7b7d4f188e6b025",
  "compact-console/australia-day/above-header/plain/true": "f3d9e8ebf2e802c397503ab95b311c76c16c0ec8bf6bd788aa60b52c99045e8b",
  "compact-console/australia-day/above-header/card/false": "da9249f928954b58dd0be23180b36ce664a9796b2755d67fe7b7d4f188e6b025",
  "compact-console/australia-day/above-header/card/true": "7948197ee10ca38ef319bc53165a35c627ade2b24a6b7f39644d974160a39c77",
  "compact-console/australia-day/below-header/plain/false": "da9249f928954b58dd0be23180b36ce664a9796b2755d67fe7b7d4f188e6b025",
  "compact-console/australia-day/below-header/plain/true": "f9cfb7a2487115c478eaf8f59a8ad063827ed9d81a1b7c5636e386ce317cb82c",
  "compact-console/australia-day/below-header/card/false": "da9249f928954b58dd0be23180b36ce664a9796b2755d67fe7b7d4f188e6b025",
  "compact-console/australia-day/below-header/card/true": "6f37900d6cd1ea2837503a69a9d3759c0dec01003dd475fddf73aeaadccf7933",
  "compact-console/australia-day/status/plain/false": "da9249f928954b58dd0be23180b36ce664a9796b2755d67fe7b7d4f188e6b025",
  "compact-console/australia-day/status/plain/true": "e9769b81526e1c344b8c37b80bb8d5e6b87f6709e50da200e6fe07757cacabe9",
  "compact-console/australia-day/status/card/false": "da9249f928954b58dd0be23180b36ce664a9796b2755d67fe7b7d4f188e6b025",
  "compact-console/australia-day/status/card/true": "129704c1a695a67bda81be80766ea74ba0c8c6dae08fdd29541d282470c7cb51",
  "compact-console/us-patriotic/header/plain/false": "3858fa77c017b1b96eb223578f66d030ce9b3bfb4a9694599e9f510d382b84f7",
  "compact-console/us-patriotic/header/plain/true": "9e8adb0333b95ab7ca517e8a622757a110d971be6d4b975c5b082a3aef33c34e",
  "compact-console/us-patriotic/header/card/false": "3858fa77c017b1b96eb223578f66d030ce9b3bfb4a9694599e9f510d382b84f7",
  "compact-console/us-patriotic/header/card/true": "f696e1abbf5cf8f219a24c0af0e2e8795c84dc302e0c3ae161f702c4414f622c",
  "compact-console/us-patriotic/above-header/plain/false": "3858fa77c017b1b96eb223578f66d030ce9b3bfb4a9694599e9f510d382b84f7",
  "compact-console/us-patriotic/above-header/plain/true": "486517daba99a55d5772de0a5416628950460350aef511140e4b7244e3315b70",
  "compact-console/us-patriotic/above-header/card/false": "3858fa77c017b1b96eb223578f66d030ce9b3bfb4a9694599e9f510d382b84f7",
  "compact-console/us-patriotic/above-header/card/true": "df7a610cf588a139abc792b3cdd286aefbdef8e4c945556be9eb2f8298c51908",
  "compact-console/us-patriotic/below-header/plain/false": "3858fa77c017b1b96eb223578f66d030ce9b3bfb4a9694599e9f510d382b84f7",
  "compact-console/us-patriotic/below-header/plain/true": "081c9a507ef1f5df5c0d1388fc015405f8cb146a39b0bb8fce93392011fd856d",
  "compact-console/us-patriotic/below-header/card/false": "3858fa77c017b1b96eb223578f66d030ce9b3bfb4a9694599e9f510d382b84f7",
  "compact-console/us-patriotic/below-header/card/true": "b0025da2b16956bba5d400e8e3e9fffaa95083545dc97971310fe1c79d47f677",
  "compact-console/us-patriotic/status/plain/false": "3858fa77c017b1b96eb223578f66d030ce9b3bfb4a9694599e9f510d382b84f7",
  "compact-console/us-patriotic/status/plain/true": "1be164287c8c4861b4f207a39aaaff124b09151a22813b4690d72adeb76fb735",
  "compact-console/us-patriotic/status/card/false": "3858fa77c017b1b96eb223578f66d030ce9b3bfb4a9694599e9f510d382b84f7",
  "compact-console/us-patriotic/status/card/true": "013c1a034226be7dcf78a2b0fc4a0006d8d0f5344192f69bdd96d1d2aa3cf832",
  "compact-console/valentines-day/header/plain/false": "70ed23e2f33bb689f563cbcae67bf6257195c55b4bccfd834a4018797470b505",
  "compact-console/valentines-day/header/plain/true": "c63352d936dbd9ddde0e91d7488ef162949bb9fcd8b72afa7e858961f1ee983e",
  "compact-console/valentines-day/header/card/false": "70ed23e2f33bb689f563cbcae67bf6257195c55b4bccfd834a4018797470b505",
  "compact-console/valentines-day/header/card/true": "46821133e4ec9164b2a92fc28e280b091f9a7f90bc1cd72edbc6b4d5a9dacec9",
  "compact-console/valentines-day/above-header/plain/false": "70ed23e2f33bb689f563cbcae67bf6257195c55b4bccfd834a4018797470b505",
  "compact-console/valentines-day/above-header/plain/true": "f993a4dfaf04f7658d0f2d564b194349f24c979bf115d00b74ca1ac7350d6282",
  "compact-console/valentines-day/above-header/card/false": "70ed23e2f33bb689f563cbcae67bf6257195c55b4bccfd834a4018797470b505",
  "compact-console/valentines-day/above-header/card/true": "559b22addc6b48ffd45d5cb68f874ef20b8aa94d3b99f82e677eab7e2adf1333",
  "compact-console/valentines-day/below-header/plain/false": "70ed23e2f33bb689f563cbcae67bf6257195c55b4bccfd834a4018797470b505",
  "compact-console/valentines-day/below-header/plain/true": "3e5413695e571189f10a1de9d7b285f73d699971ca106d7a88f5e3dce7b6d243",
  "compact-console/valentines-day/below-header/card/false": "70ed23e2f33bb689f563cbcae67bf6257195c55b4bccfd834a4018797470b505",
  "compact-console/valentines-day/below-header/card/true": "129d11fc264f40e8b3041f58609fb4e9b40e80cb914b89216ca4b9a668be7e35",
  "compact-console/valentines-day/status/plain/false": "70ed23e2f33bb689f563cbcae67bf6257195c55b4bccfd834a4018797470b505",
  "compact-console/valentines-day/status/plain/true": "23abd549f7c3593580f15fe803fbb82855c570e74cbf7db0aa1fde0d68498d68",
  "compact-console/valentines-day/status/card/false": "70ed23e2f33bb689f563cbcae67bf6257195c55b4bccfd834a4018797470b505",
  "compact-console/valentines-day/status/card/true": "defdb1e23439f150200f7f4f879ec8fe7773875cdfebe3b518ec171412e1eff3"
};

import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {registry,parseBackup} from '../src/template-registry.js';
import {welcomeDefaults,welcomeColourCSS,welcomeTokens} from '../src/welcome-message.js';
import {escapeHTML} from '../src/shared-settings.js';
const fields=['customWelcomeColours','welcomeCardColour','welcomeTextColour'];
const hash=html=>createHash('sha256').update(normalizeReleaseMetadataForBaseline(html)).digest('hex');
const sources=Object.fromEntries(registry.map(t=>[t.id,readFileSync(new URL('../'+t.source,import.meta.url),'utf8')]));
for(const t of registry){
 test(t.id+': colour overrides add only scoped surface/text CSS, retaining all original output otherwise',()=>{
  for(const theme of Object.keys(t.themes))for(const welcomePosition of ['header','above-header','below-header','status'])for(const welcomeStyle of ['plain','card'])for(const showWelcome of [false,true]){
   const s={...t.cloneDefaults(theme),welcomePosition,welcomeStyle,showWelcome,welcome:'Custom welcome & <safe>\nEnjoy the show.'};
   const key=[t.id,theme,welcomePosition,welcomeStyle,showWelcome].join('/'),old=baseline[key],before=t.render(sources[t.id],s);assert.equal(hash(before),old,key+' default unchanged');
   const legacy={...s};for(const field of fields)delete legacy[field];assert.equal(hash(t.render(sources[t.id],legacy)),old,key+' missing keys unchanged');
   s.welcomeCardColour='#E1D3C5';s.welcomeTextColour='#123aBc';assert.equal(hash(t.render(sources[t.id],s)),old,key+' disabled choices unchanged');
   s.customWelcomeColours=true;const html=t.render(sources[t.id],s),css=welcomeColourCSS(s),active=showWelcome&&welcomeStyle==='card';
   assert.equal(Boolean(css),active,key);assert.equal(hash(active?html.replace(css,''):html),old,key+' only colour rules added');
   assert.equal(t.renderDraft(sources[t.id],s).html,html,key+' draft/export parity');
   if(active){assert.match(css,/\.section-card\.welcome-message\{background:#E1D3C5;color:#123aBc\}/);assert.match(css,/\.section-card\.welcome-message>\.neighbour-message\{color:#123aBc\}/);assert.doesNotMatch(css,/padding|border|radius|font|position|margin|--panel|visitor-guidance/);}
   const blank={...s,welcome:'   '};assert.equal(welcomeColourCSS(blank),'');assert.equal(t.render(sources[t.id],blank),t.render(sources[t.id],{...blank,customWelcomeColours:false}));
   // Applying custom colour never alters card HTML or the native placement hooks.
   assert.deepEqual(welcomeTokens(s,escapeHTML),welcomeTokens({...s,customWelcomeColours:false},escapeHTML));
  }
 });
 test(t.id+': colour fields retain hidden selections through legacy/new backups, themes and defaults',()=>{
  const defaults=t.cloneDefaults();assert.equal(defaults.customWelcomeColours,false);assert.equal(defaults.welcomeCardColour,'#263746');assert.equal(defaults.welcomeTextColour,'#ffffff');
  for(const theme of Object.keys(t.themes))for(const customWelcomeColours of [false,true]){
   const s={...t.cloneDefaults(theme),customWelcomeColours,welcomeCardColour:'#E1D3C5',welcomeTextColour:'#123aBc',welcomeStyle:'plain',showWelcome:false};
   assert.deepEqual(t.checkedSettings(s),s);
   const loaded=parseBackup(JSON.stringify({format:'seasonal-designs',version:1,template:t.id,designs:{[theme]:s}})).designs[theme];assert.deepEqual(loaded,s);
   const old={...s};for(const key of fields)delete old[key];const migrated=t.checkedSettings(old);for(const key of fields)assert.equal(migrated[key],welcomeDefaults[key]);assert.equal(migrated.showWelcome,false);
   const backup=t.separateSeasons?t.settingsFile({christmas:t.cloneDefaults(),halloween:t.cloneDefaults('halloween'),[theme]:s}):t.settingsFile(s);
   assert.deepEqual(parseBackup(backup).designs[theme],s);
   if(t.changeTheme)for(const targetTheme of Object.keys(t.themes)){const changed=t.changeTheme(s,targetTheme);for(const key of fields)assert.equal(changed[key],s[key]);}
  }
 });
 test(t.id+': strict six-digit colour validation rejects CSS injection even while disabled',()=>{
  for(const field of ['welcomeCardColour','welcomeTextColour'])for(const bad of ['#fff','red','#1234567','#12345g','#123456;background:red','</style><script>alert(1)</script>',null,1,false])for(const enabled of [false,true]){
   const s={...t.cloneDefaults(),customWelcomeColours:enabled,[field]:bad};assert.throws(()=>t.checkedSettings(s),/welcome/i);assert.throws(()=>t.renderDraft(sources[t.id],s),/welcome/i);
  }
  for(const bad of [null,'true',1])assert.throws(()=>t.checkedSettings({...t.cloneDefaults(),customWelcomeColours:bad}),/customWelcomeColours/);
  assert.throws(()=>welcomeColourCSS({...t.cloneDefaults(),customWelcomeColours:true,showWelcome:true,welcomeStyle:'card',welcomeCardColour:'red'}),/welcome colour/);
 });
}
