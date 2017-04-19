/*
 * Apex story
 *
 * A react-storybook story for the Apex component
 */

 import React from 'react'
 import { storiesOf } from '@kadira/storybook'
 import Apex from './component'

 const displayName = Apex.displayName || 'Apex'
 const title = 'Simple usage'
 const description = `
   This is some basic usage with the Apex component.
   More to come later.`

 const demoCode = () => (
   <Apex />
 )

 const propDocs = { inline: true, propTables: [Apex] }

 storiesOf(displayName, module)
   .addWithInfo(
     title,
     description,
     demoCode,
     propDocs
   )

