/* Picks the right component for an exercise. */
import type { Exercise } from '../../../content/types'
import { Fill } from './Fill'
import { Match } from './Match'
import { MultipleChoice } from './MultipleChoice'
import { NumberEx } from './NumberEx'
import { Scenario } from './Scenario'
import { Sort } from './Sort'
import { Teach } from './Teach'
import { TrueFalse } from './TrueFalse'
import type { ExerciseProps } from './types'

export function ExerciseView(props: ExerciseProps<Exercise>) {
  const { ex, ...rest } = props
  switch (ex.type) {
    case 'teach':
      return <Teach ex={ex} />
    case 'mc':
      return <MultipleChoice ex={ex} {...rest} />
    case 'tf':
      return <TrueFalse ex={ex} {...rest} />
    case 'match':
      return <Match ex={ex} {...rest} />
    case 'sort':
      return <Sort ex={ex} {...rest} />
    case 'scenario':
      return <Scenario ex={ex} {...rest} />
    case 'fill':
      return <Fill ex={ex} {...rest} />
    case 'number':
      return <NumberEx ex={ex} {...rest} />
  }
}
