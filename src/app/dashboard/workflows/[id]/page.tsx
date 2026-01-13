'use client'

import React, { use } from 'react'
import WorkflowEditor from "../builder/workflow-editor"

export default function BuilderPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    return <WorkflowEditor workflowId={id} />
}
